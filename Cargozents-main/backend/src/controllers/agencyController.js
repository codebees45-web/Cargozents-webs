const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Shipment = require('../models/Shipment');

/** GET /api/agency/dashboard — fleet size, availability, rating summary */
const getDashboard = async (req, res, next) => {
  try {
    const drivers = await User.find({ 'driverProfile.agency': req.user._id, role: 'driver' });
    const fleetSize = drivers.length;
    const availableNow = drivers.filter((d) => d.driverProfile?.isAvailable).length;
    const avgRating =
      fleetSize === 0
        ? 0
        : Number(
            (drivers.reduce((sum, d) => sum + (d.driverProfile?.rating || 0), 0) / fleetSize).toFixed(1)
          );

    if (req.user.agencyProfile.fleetSize !== fleetSize) {
      req.user.agencyProfile.fleetSize = fleetSize;
      req.user.markModified('agencyProfile');
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      stats: { fleetSize, availableNow, avgRating },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/agency/drivers — list drivers currently linked to this agency */
// Temporarily add this to your backend auth middleware or route controller

const getDrivers = async (req, res, next) => {
  try {
    const drivers = await User.find({ 'driverProfile.agency': req.user._id, role: 'driver' }).select(
      'name email phone driverProfile isApproved isSuspended createdAt'
    );
    // Temporarily add this to your backend auth middleware or route controller
    console.log("Headers received:", req.headers.authorization);
    console.log("User attached by middleware:", req.user);
    res.status(200).json({ success: true, drivers });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/agency/drivers/lookup/:phone — preview a driver account by phone
 * before linking. Does NOT modify anything.
 */
const lookupDriverByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    if (!/^[6-9]\d{9}$/.test(phone || '')) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit phone number' });
    }

    const driver = await User.findOne({ phone, role: 'driver' }).select(
      'name phone profileImage driverProfile isApproved isSuspended'
    );
    if (!driver) {
      return res.status(404).json({ success: false, message: 'No driver account found with that phone number' });
    }

    const alreadyLinkedToUs = driver.driverProfile.agency?.toString() === req.user._id.toString();
    const alreadyLinkedElsewhere = !!driver.driverProfile.agency && !alreadyLinkedToUs;

    res.status(200).json({
      success: true,
      driver,
      alreadyLinkedToUs,
      alreadyLinkedElsewhere,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/agency/drivers — link an existing driver account to this agency
 * Body: { phone }  — the driver must already be registered on the platform.
 */
const addDriver = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Driver phone number is required' });

    const driver = await User.findOne({ phone, role: 'driver' });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'No driver account found with that phone number' });
    }
    if (driver.driverProfile.agency) {
      return res.status(409).json({ success: false, message: 'This driver already belongs to an agency' });
    }

    driver.driverProfile.agency = req.user._id;
    await driver.save();

    res.status(200).json({ success: true, message: 'Driver added to your fleet', driver });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/agency/drivers/:id — unlink a driver from this agency's fleet */
const removeDriver = async (req, res, next) => {
  try {
    const driver = await User.findOne({ _id: req.params.id, 'driverProfile.agency': req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found in your fleet' });

    driver.driverProfile.agency = null;
    await driver.save();

    res.status(200).json({ success: true, message: 'Driver removed from your fleet' });
  } catch (err) {
    next(err);
  }
};

/** GET /api/agency/fleet-vehicles — fleet with assigned driver + location, for the tracking map */
const getFleetVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ agency: req.user._id })
      .populate('driver', 'name phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, vehicles });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/agency/fleet-vehicles/:id/location — manually set a vehicle's
 * position (for drivers with no smartphone to run live GPS sharing).
 * Body: { coordinates: [lng, lat] }
 */
const setVehicleLocation = async (req, res, next) => {
  try {
    const { coordinates } = req.body;
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: 'coordinates must be [lng, lat]' });
    }
    const [lng, lat] = coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number' || Number.isNaN(lng) || Number.isNaN(lat)) {
      return res.status(400).json({ success: false, message: 'coordinates must be numeric [lng, lat]' });
    }

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, agency: req.user._id },
      {
        currentLocation: { type: 'Point', coordinates },
        locationUpdatedAt: new Date(),
        locationSource: 'manual',
        isSharingLocation: false,
      },
      { new: true }
    ).populate('driver', 'name phone');

    if (!vehicle) return res.status(404).json({ success: false, message: 'Truck not found in your fleet' });

    res.status(200).json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
};

/** GET /api/agency/trucks — list this agency's fleet */
const getTrucks = async (req, res, next) => {
  try {
    const trucks = await Vehicle.find({ agency: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, trucks });
  } catch (err) {
    next(err);
  }
};

/** POST /api/agency/trucks — register a new truck to this agency's fleet */
const addTruck = async (req, res, next) => {
  try {
    const { registrationNumber, type, capacityWeight, locationLabel, photos, documents } = req.body;

    if (!registrationNumber || !type || !capacityWeight) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number, type, and capacity are required',
      });
    }

    const existing = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A truck with this registration number already exists' });
    }

    const truck = await Vehicle.create({
      agency: req.user._id,
      registrationNumber,
      type,
      capacityWeight,
      locationLabel: locationLabel || '',
      photos: photos || [],
      documents: {
        rcBook: documents?.rcBook || '',
        insurance: documents?.insurance || '',
        permit: documents?.permit || '',
      },
    });

    res.status(201).json({ success: true, truck });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/agency/trucks/:id — update a truck (e.g. toggle availability) */
const updateTruck = async (req, res, next) => {
  try {
    const truck = await Vehicle.findOne({ _id: req.params.id, agency: req.user._id });
    if (!truck) return res.status(404).json({ success: false, message: 'Truck not found in your fleet' });

    const editable = ['type', 'capacityWeight', 'locationLabel', 'photos', 'documents', 'isActive'];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) truck[field] = req.body[field];
    });

    await truck.save();
    res.status(200).json({ success: true, truck });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/agency/trucks/:id — remove a truck from the fleet */
const deleteTruck = async (req, res, next) => {
  try {
    const truck = await Vehicle.findOneAndDelete({ _id: req.params.id, agency: req.user._id });
    if (!truck) return res.status(404).json({ success: false, message: 'Truck not found in your fleet' });
    res.status(200).json({ success: true, message: 'Truck removed from your fleet' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/agency/fleet-stats — per-truck utilization & earnings, plus
 * fleet-wide totals, computed from delivered shipments assigned to this
 * agency's vehicles.
 */
const getFleetStats = async (req, res, next) => {
  try {
    const trucks = await Vehicle.find({ agency: req.user._id }).sort({ createdAt: -1 });

    if (trucks.length === 0) {
      return res.status(200).json({
        success: true,
        summary: { fleetSize: 0, activeTrucks: 0, totalRevenue: 0, totalTrips: 0, avgUtilization: 0 },
        trucks: [],
      });
    }

    const truckIds = trucks.map((t) => t._id);
    const shipments = await Shipment.find({
      assignedVehicle: { $in: truckIds },
      status: 'delivered',
    }).select('assignedVehicle finalPrice');

    const statsByTruck = new Map();
    truckIds.forEach((id) => statsByTruck.set(String(id), { trips: 0, revenue: 0 }));
    shipments.forEach((s) => {
      const key = String(s.assignedVehicle);
      const entry = statsByTruck.get(key);
      if (entry) {
        entry.trips += 1;
        entry.revenue += Number(s.finalPrice || 0);
      }
    });

    const maxTrips = Math.max(1, ...Array.from(statsByTruck.values()).map((v) => v.trips));

    const truckStats = trucks.map((t) => {
      const stat = statsByTruck.get(String(t._id)) || { trips: 0, revenue: 0 };
      return {
        _id: t._id,
        registrationNumber: t.registrationNumber,
        type: t.type,
        isActive: t.isActive,
        isVerified: t.isVerified,
        trips: stat.trips,
        revenue: stat.revenue,
        utilization: Math.round((stat.trips / maxTrips) * 100),
      };
    });

    const totalRevenue = truckStats.reduce((sum, t) => sum + t.revenue, 0);
    const totalTrips = truckStats.reduce((sum, t) => sum + t.trips, 0);
    const activeTrucks = trucks.filter((t) => t.isActive).length;
    const avgUtilization = Math.round(
      truckStats.reduce((sum, t) => sum + t.utilization, 0) / truckStats.length
    );

    res.status(200).json({
      success: true,
      summary: {
        fleetSize: trucks.length,
        activeTrucks,
        totalRevenue,
        totalTrips,
        avgUtilization,
      },
      trucks: truckStats.sort((a, b) => b.revenue - a.revenue),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  lookupDriverByPhone,
  getFleetVehicles,
  setVehicleLocation,
  getDashboard,
  getDrivers,
  addDriver,
  removeDriver,
  getTrucks,
  addTruck,
  updateTruck,
  deleteTruck,
  getFleetStats,
};