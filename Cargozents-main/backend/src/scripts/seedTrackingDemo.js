/**
 * One-off seed script: creates just enough data to see the live tracking
 * map actually render pins (pickup, drop, and a moving truck icon) instead
 * of the "No shipments to track yet" / "Select a shipment" empty states.
 *
 * Creates:
 *   - 1 agency user      (agency@demo.com   / Password123)
 *   - 1 shipper user      (shipper@demo.com  / Password123)
 *   - 1 driver user, linked to the agency (driver@demo.com / Password123)
 *   - 1 vehicle, owned by that driver, with a real currentLocation
 *   - 1 shipment, assigned to that driver/vehicle, status = 'in_transit'
 *
 * Route: Mumbai (pickup) -> Pune (drop), truck currently somewhere on the
 * highway between them so both endpoints AND a moving marker show up.
 *
 * Usage (from backend/):
 *   node src/scripts/seedTrackingDemo.js
 *
 * Safe to re-run: it deletes any previous demo records with these emails
 * first, so you can run it again after tinkering with statuses etc.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Shipment = require('../models/Shipment');

const DEMO_EMAILS = ['agency@demo.com', 'shipper@demo.com', 'driver@demo.com'];
const DEMO_REG_NUMBER = 'MH12DM1234';

// [lng, lat] — GeoJSON order, matches how every model in this app stores coords.
const MUMBAI = [72.8777, 19.0760];
const PUNE = [73.8567, 18.5204];
const ON_THE_HIGHWAY = [73.3, 18.75]; // roughly midway, for the "live" truck marker

async function seed() {
  await connectDB();

  // --- Clean up any previous run of this script ---
  const oldUsers = await User.find({ email: { $in: DEMO_EMAILS } }, '_id');
  const oldUserIds = oldUsers.map((u) => u._id);
  await Shipment.deleteMany({ shipper: { $in: oldUserIds } });
  await Vehicle.deleteMany({ registrationNumber: DEMO_REG_NUMBER });
  await User.deleteMany({ email: { $in: DEMO_EMAILS } });

  // --- Agency ---
  const agency = await User.create({
    name: 'Alex A',
    email: 'agency@demo.com',
    phone: '9876543210',
    password: 'Password123',
    role: 'agency',
    isVerified: true,
    isApproved: true,
    agencyProfile: {
      companyName: 'Alex Logistics',
      fleetSize: 1,
    },
  });

  // --- Shipper ---
  const shipper = await User.create({
    name: 'Demo Shipper',
    email: 'shipper@demo.com',
    phone: '9876543211',
    password: 'Password123',
    role: 'shipper',
    isVerified: true,
  });

  // --- Driver, linked to the agency ---
  const driver = await User.create({
    name: 'Ramesh Kumar',
    email: 'driver@demo.com',
    phone: '9876543212',
    password: 'Password123',
    role: 'driver',
    isVerified: true,
    isApproved: true,
    driverProfile: {
      agency: agency._id,
      isAvailable: false, // currently on this trip
      currentLocation: { type: 'Point', coordinates: ON_THE_HIGHWAY },
      locationUpdatedAt: new Date(),
    },
  });

  // --- Vehicle, with a real live location so the truck marker renders ---
  const vehicle = await Vehicle.create({
    driver: driver._id,
    registrationNumber: DEMO_REG_NUMBER,
    type: 'container',
    capacityWeight: 5000,
    capacityVolume: 20,
    isVerified: true,
    isActive: true,
    currentLocation: { type: 'Point', coordinates: ON_THE_HIGHWAY },
    locationUpdatedAt: new Date(),
    isSharingLocation: true,
    locationSource: 'gps',
  });

  // --- Shipment, already assigned + in transit ---
  // IMPORTANT: TruckTracking.jsx calls getMyShipments for any non-driver
  // role (including 'agency'), which filters by `shipper === req.user._id`
  // on the backend (see shipmentController.getMyShipments). So for this
  // shipment to show up when you log in as the AGENCY on
  // /agency/truck-tracking, its `shipper` must be the agency's own _id —
  // not a separate shipper account.
  const shipment = await Shipment.create({
    shipper: agency._id,
    source: 'manual',
    goodsType: 'Electronics',
    weight: 1200,
    volume: 8,
    vehicleRequired: 'container',
    pickup: {
      address: 'Andheri East Warehouse',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',
      location: { type: 'Point', coordinates: MUMBAI },
    },
    drop: {
      address: 'Hinjewadi IT Park',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411057',
      location: { type: 'Point', coordinates: PUNE },
    },
    scheduledDate: new Date(),
    scheduledTime: '09:00',
    estimatedPrice: 8500,
    finalPrice: 8500,
    status: 'in_transit',
    assignedDriver: driver._id,
    assignedVehicle: vehicle._id,
    assignedBy: agency._id,
    assignedAt: new Date(Date.now() - 60 * 60 * 1000), // 1h ago
    trackingHistory: [
      { status: 'requested', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      { status: 'assigned', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { status: 'accepted', timestamp: new Date(Date.now() - 90 * 60 * 1000) },
      {
        status: 'picked_up',
        location: { type: 'Point', coordinates: MUMBAI },
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        status: 'in_transit',
        location: { type: 'Point', coordinates: ON_THE_HIGHWAY },
        timestamp: new Date(),
      },
    ],
  });

  console.log('\n✅ Seed complete!\n');
  console.log('Log in with any of these (password: Password123):');
  console.log('  Agency:  agency@demo.com   <- log in with THIS one to see the tracking demo');
  console.log('  Shipper: shipper@demo.com  (created, but has no shipments in this seed)');
  console.log('  Driver:  driver@demo.com');
  console.log(`\nShipment ID: ${shipment._id}`);
  console.log('Visit http://localhost:5173/agency/truck-tracking (logged in as agency@demo.com) to see it.\n');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});