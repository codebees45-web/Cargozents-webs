const Shipment = require('../models/Shipment');

// Revenue for a shipment: prefer the agreed finalPrice, fall back to the
// original estimate, default to 0 if neither is set.
const REVENUE_EXPR = { $ifNull: ['$finalPrice', { $ifNull: ['$estimatedPrice', 0] }] };

// Human-friendly tracking code derived from the Mongo _id (no separate
// tracking-number field exists on the Shipment model).
const TRACKING_NUMBER_EXPR = {
  $concat: ['CGZ-', { $toUpper: { $substrCP: [{ $toString: '$_id' }, 18, 6] } }],
};

/**
 * GET /api/shipment-analytics
 * Paginated/filtered shipment list, built directly from MongoDB.
 * Query params: page, limit, sortBy, order, search, status, shipper_name,
 * pickup_city, drop_city.
 */
const getShipmentList = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const { sortBy, order, search, status, shipper_name, pickup_city, drop_city } = req.query;

    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'shipper',
          foreignField: '_id',
          as: 'shipperInfo',
        },
      },
      { $unwind: { path: '$shipperInfo', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          revenue: REVENUE_EXPR,
          trackingNumber: TRACKING_NUMBER_EXPR,
          shipperName: { $ifNull: ['$shipperInfo.name', 'Unknown shipper'] },
        },
      },
    ];

    const match = {};
    if (status) match.status = status;
    if (pickup_city) match['pickup.city'] = new RegExp(pickup_city, 'i');
    if (drop_city) match['drop.city'] = new RegExp(drop_city, 'i');
    if (shipper_name) match.shipperName = new RegExp(shipper_name, 'i');
    if (search) {
      const re = new RegExp(search, 'i');
      match.$or = [
        { shipperName: re },
        { trackingNumber: re },
        { 'pickup.city': re },
        { 'drop.city': re },
        { goodsType: re },
      ];
    }
    if (Object.keys(match).length) pipeline.push({ $match: match });

    const sortField =
      { revenue: 'revenue', status: 'status', createdAt: 'createdAt', shipper_name: 'shipperName' }[sortBy] ||
      'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    pipeline.push({ $sort: { [sortField]: sortOrder } });

    pipeline.push({
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              id: '$_id',
              tracking_number: '$trackingNumber',
              shipper_name: '$shipperName',
              pickup_city: '$pickup.city',
              drop_city: '$drop.city',
              status: 1,
              revenue: 1,
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    });

    const [result] = await Shipment.aggregate(pipeline);
    const rows = result?.data || [];
    const totalItems = result?.totalCount?.[0]?.count || 0;
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

    res.status(200).json({
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/shipment-analytics/summary
 * Aggregate revenue/status/top-shipper stats, built directly from MongoDB.
 */
const getShipmentSummary = async (req, res, next) => {
  try {
    const [result] = await Shipment.aggregate([
      { $addFields: { revenue: REVENUE_EXPR } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$revenue' },
                totalShipments: { $sum: 1 },
              },
            },
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                revenue: { $sum: '$revenue' },
                count: { $sum: 1 },
              },
            },
            { $project: { _id: 0, status: '$_id', revenue: 1, count: 1 } },
            { $sort: { revenue: -1 } },
          ],
          topShippers: [
            {
              $group: {
                _id: '$shipper',
                totalRevenue: { $sum: '$revenue' },
                shipmentCount: { $sum: 1 },
              },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'shipperInfo',
              },
            },
            { $unwind: { path: '$shipperInfo', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                shipperName: { $ifNull: ['$shipperInfo.name', 'Unknown shipper'] },
                shipmentCount: 1,
                totalRevenue: 1,
              },
            },
          ],
        },
      },
    ]);

    const totalRevenue = result?.totals?.[0]?.totalRevenue || 0;
    const totalShipments = result?.totals?.[0]?.totalShipments || 0;
    const averageRevenue = totalShipments > 0 ? Math.round(totalRevenue / totalShipments) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        averageRevenue,
        totalShipments,
        byStatus: result?.byStatus || [],
        topShippers: result?.topShippers || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getShipmentList, getShipmentSummary };