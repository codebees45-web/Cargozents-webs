const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboard,
  getDrivers,
  lookupDriverByPhone,
  addDriver,
  removeDriver,
  getTrucks,
  addTruck,
  updateTruck,
  deleteTruck,
  getFleetStats,
  getFleetVehicles,
  setVehicleLocation,
} = require('../controllers/agencyController');

const router = express.Router();

router.use(protect, authorize('agency'));

router.get('/dashboard', getDashboard);
router.get('/fleet-stats', getFleetStats);
router.get('/fleet-vehicles', getFleetVehicles);
router.patch('/fleet-vehicles/:id/location', setVehicleLocation);
router.get('/drivers', getDrivers);
router.get('/drivers/lookup/:phone', lookupDriverByPhone);
router.post('/drivers', addDriver);
router.delete('/drivers/:id', removeDriver);

router.get('/trucks', getTrucks);
router.post('/trucks', addTruck);
router.patch('/trucks/:id', updateTruck);
router.delete('/trucks/:id', deleteTruck);

module.exports = router;