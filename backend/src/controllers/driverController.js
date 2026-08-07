const Vehicle = require('../models/Vehicle');
const Document = require('../models/Document');
const Shipment = require('../models/Shipment');

/**
 * POST /api/drivers/vehicles
 * Register a vehicle under the logged-in driver. Starts unverified —
 * admin must approve its documents before it becomes bookable.
 */
const registerVehicle = async (req, res, next) => {
  try {
    const { registrationNumber, type, capacityWeight, capacityVolume, photos } = req.body;

    if (!registrationNumber || !type || !capacityWeight) {
      return res.status(400).json({ success: false, message: 'registrationNumber, type and capacityWeight are required' });
    }

    const existing = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This vehicle is already registered' });
    }

    const vehicle = await Vehicle.create({
      driver: req.user._id,
      registrationNumber,
      type,
      capacityWeight,
      capacityVolume,
      photos: photos || [],
    });

    res.status(201).json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
};

/** GET /api/drivers/vehicles/mine */
const getMyVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ driver: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, vehicles });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/drivers/documents
 * Records a verification document. The file itself is expected to already
 * be uploaded client-side to Cloudinary (unsigned upload widget); this
 * endpoint just persists the resulting URL and puts it in the admin queue.
 * Body: { type, fileUrl, vehicleId?, expiryDate? }
 */
const uploadDocument = async (req, res, next) => {
  try {
    const { type, fileUrl, vehicleId, expiryDate } = req.body;
    const validTypes = ['driving_license', 'selfie', 'rc', 'permit', 'insurance', 'vehicle_photo'];

    if (!type || !validTypes.includes(type) || !fileUrl) {
      return res.status(400).json({ success: false, message: 'Valid document type and fileUrl are required' });
    }

    const vehicleOnlyTypes = ['rc', 'permit', 'insurance', 'vehicle_photo'];
    if (vehicleOnlyTypes.includes(type)) {
      if (!vehicleId) {
        return res.status(400).json({ success: false, message: `vehicleId is required for document type '${type}'` });
      }
      const vehicle = await Vehicle.findOne({ _id: vehicleId, driver: req.user._id });
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found for this driver' });
      }
    }

    const document = await Document.create({
      owner: req.user._id,
      vehicle: vehicleOnlyTypes.includes(type) ? vehicleId : null,
      type,
      fileUrl,
      expiryDate: expiryDate || null,
      status: 'pending',
    });

    res.status(201).json({ success: true, document });
  } catch (err) {
    next(err);
  }
};

/** GET /api/drivers/documents/mine */
const getMyDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ owner: req.user._id }).sort({ createdAt: -1 }).populate('vehicle', 'registrationNumber');
    res.status(200).json({ success: true, documents });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/drivers/availability
 * Body: { isAvailable: boolean }
 */
const setAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    req.user.driverProfile.isAvailable = !!isAvailable;
    await req.user.save();
    res.status(200).json({ success: true, isAvailable: req.user.driverProfile.isAvailable });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/drivers/location
 * Body: { coordinates: [lng, lat], vehicleId?, shipmentId?, accuracy? }
 * Mirrors the driver's live position onto both User (for general lookup)
 * and, if given, their active Vehicle (what the matching engine queries).
 * If shipmentId is given too, also drops a breadcrumb into that
 * shipment's trackingHistory — this is what feeds the live tracking map
 * with a continuous trail between status changes, rather than only a
 * point per lifecycle transition.
 *
 * This is fed by the driver's own device (browser Geolocation API /
 * mobile GPS) while they have live sharing switched on for a trip — see
 * frontend hooks/useLiveLocationSharing.js. It intentionally does NOT
 * pull location from telecom/IMEI-based positioning: that requires
 * carrier or law-enforcement access this app doesn't have, is far less
 * accurate than device GPS, and raises consent/privacy issues we'd
 * rather not touch. Fleet-mounted hardware GPS (common with agencies)
 * can report into this exact same endpoint later — it's just another
 * caller with a valid driver/vehicle token — so no rework is needed if
 * an agency onboards real hardware trackers.
 */
const updateLocation = async (req, res, next) => {
  try {
    const { coordinates, vehicleId, shipmentId, accuracy } = req.body;
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: 'coordinates must be [lng, lat]' });
    }
    const [lng, lat] = coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number' || Number.isNaN(lng) || Number.isNaN(lat)) {
      return res.status(400).json({ success: false, message: 'coordinates must be numeric [lng, lat]' });
    }

    // A very low-accuracy fix (e.g. cell-tower fallback indoors) is worse
    // than no update at all — it can make the marker jump miles away and
    // back. Skip writing it rather than corrupting the trail.
    if (typeof accuracy === 'number' && accuracy > 500) {
      return res.status(200).json({ success: true, skipped: true, reason: 'accuracy too low' });
    }

    const now = new Date();

    req.user.driverProfile.currentLocation = { type: 'Point', coordinates };
    req.user.driverProfile.locationUpdatedAt = now;
    await req.user.save();

    if (vehicleId) {
      await Vehicle.findOneAndUpdate(
        { _id: vehicleId, driver: req.user._id },
        { currentLocation: { type: 'Point', coordinates }, locationUpdatedAt: now, isSharingLocation: true }
      );
    }

    if (shipmentId) {
      const shipment = await Shipment.findOne({ _id: shipmentId, assignedDriver: req.user._id });
      if (shipment && ['accepted', 'picked_up', 'in_transit'].includes(shipment.status)) {
        shipment.trackingHistory.push({
          status: shipment.status,
          location: { type: 'Point', coordinates },
          timestamp: now,
        });
        await shipment.save();
      }
    }

    // Push this fix out over Socket.IO immediately instead of making
    // every tracking screen wait for its next poll. Anyone who has
    // joined the `vehicle:<id>` room (buyer/shipper/admin viewing this
    // vehicle's map) gets it in real time; `fleet` is a single room the
    // network-wide admin map listens to so it doesn't need to join one
    // room per vehicle on screen.
    const io = req.app.get('io');
    if (io && vehicleId) {
      const payload = { vehicleId, shipmentId: shipmentId || null, coordinates, accuracy: accuracy ?? null, locationUpdatedAt: now };
      io.to(`vehicle:${vehicleId}`).emit('location-update', payload);
      io.to('fleet').emit('location-update', payload);
      if (shipmentId) io.to(`shipment:${shipmentId}`).emit('location-update', payload);
    }

    res.status(200).json({ success: true, locationUpdatedAt: now });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/drivers/location/stop
 * Body: { vehicleId? }
 * Called when the driver explicitly toggles live sharing off. Flips
 * isSharingLocation so the tracking map can immediately show "driver
 * turned off sharing" instead of waiting for the staleness timeout to
 * guess that something's wrong.
 */
const stopSharingLocation = async (req, res, next) => {
  try {
    const { vehicleId } = req.body;
    if (vehicleId) {
      await Vehicle.findOneAndUpdate(
        { _id: vehicleId, driver: req.user._id },
        { isSharingLocation: false }
      );

      // Let live map viewers know sharing stopped right away, rather than
      // them figuring it out only once the staleness timeout kicks in.
      const io = req.app.get('io');
      if (io) {
        const payload = { vehicleId, stopped: true };
        io.to(`vehicle:${vehicleId}`).emit('location-stopped', payload);
        io.to('fleet').emit('location-stopped', payload);
      }
    }
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/drivers/wallet
 * Computes the driver's earnings from delivered shipments. There's no
 * separate ledger/payout model yet, so this is derived directly from
 * Shipment.finalPrice on delivered loads — the full amount is treated as
 * the driver's credited earning for that trip. Swap this out for a real
 * ledger (with commission splits, payouts, etc.) if that's ever added.
 */
const getWallet = async (req, res, next) => {
  try {
    const deliveredShipments = await Shipment.find({
      assignedDriver: req.user._id,
      status: 'delivered',
    }).sort({ updatedAt: -1 });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let totalEarnings = 0;
    let thisMonthEarnings = 0;

    const transactions = deliveredShipments.map((s) => {
      const amount = s.finalPrice ?? s.estimatedPrice ?? 0;
      const deliveredEntry = [...s.trackingHistory].reverse().find((t) => t.status === 'delivered');
      const deliveredAt = deliveredEntry?.timestamp || s.updatedAt;

      totalEarnings += amount;
      if (deliveredAt >= startOfMonth) thisMonthEarnings += amount;

      return {
        shipmentId: s._id,
        amount,
        route: `${s.pickup?.city} → ${s.drop?.city}`,
        goodsType: s.goodsType,
        isBackhaulMatch: s.isBackhaulMatch,
        deliveredAt,
      };
    });

    res.status(200).json({
      success: true,
      wallet: {
        totalEarnings,
        thisMonthEarnings,
        completedTrips: deliveredShipments.length,
        transactions,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerVehicle,
  getMyVehicles,
  uploadDocument,
  getMyDocuments,
  setAvailability,
  updateLocation,
  stopSharingLocation,
  getWallet,
};