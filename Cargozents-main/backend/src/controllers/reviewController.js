const Review = require('../models/Review');
const Shipment = require('../models/Shipment');
const Order = require('../models/Order');
const User = require('../models/User');

/**
 * Recomputes a user's average rating + count from the Review collection
 * and writes it back onto the right profile sub-field. Called after every
 * new review so driverProfile.rating / shipperProfile.rating stay in sync
 * without needing a separate cron/aggregation job.
 */
const recomputeRating = async (userId, revieweeRole) => {
  const stats = await Review.aggregate([
    { $match: { reviewee: userId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  const rounded = Math.round(avg * 10) / 10;

  if (revieweeRole === 'driver') {
    await User.findByIdAndUpdate(userId, {
      'driverProfile.rating': rounded,
      'driverProfile.reviewsCount': count,
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      'shipperProfile.rating': rounded,
      'shipperProfile.reviewsCount': count,
    });
  }
};

/**
 * POST /api/reviews/shipment/:shipmentId
 * Shipper rates the driver who carried a delivered shipment.
 * Body: { rating, comment? }
 */
const reviewShipmentDriver = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const shipment = await Shipment.findById(req.params.shipmentId);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
    if (!shipment.shipper.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this shipment' });
    }
    if (shipment.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'You can only review a shipment after it has been delivered' });
    }
    if (!shipment.assignedDriver) {
      return res.status(400).json({ success: false, message: 'This shipment has no assigned driver to review' });
    }

    let review;
    try {
      review = await Review.create({
        reviewer: req.user._id,
        reviewee: shipment.assignedDriver,
        revieweeRole: 'driver',
        shipment: shipment._id,
        rating,
        comment: comment || '',
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'You already reviewed this shipment' });
      }
      throw err;
    }

    await recomputeRating(shipment.assignedDriver, 'driver');

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/reviews/order/:orderId
 * Buyer rates the shipper who fulfilled a delivered order.
 * Body: { rating, comment? }
 */
const reviewOrderShipper = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.buyer.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this order' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'You can only review an order after it has been delivered' });
    }

    let review;
    try {
      review = await Review.create({
        reviewer: req.user._id,
        reviewee: order.shipper,
        revieweeRole: 'shipper',
        order: order._id,
        rating,
        comment: comment || '',
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'You already reviewed this order' });
      }
      throw err;
    }

    await recomputeRating(order.shipper, 'shipper');

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

/** GET /api/reviews/user/:userId — public reviews received by a driver or shipper */
const getReviewsForUser = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('reviewer', 'name');
    res.status(200).json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  reviewShipmentDriver,
  reviewOrderShipper,
  getReviewsForUser,
};