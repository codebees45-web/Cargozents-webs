const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  registerVehicle,
  getMyVehicles,
  uploadDocument,
  getMyDocuments,
  setAvailability,
  updateLocation,
  stopSharingLocation,
  getWallet,
} = require('../controllers/driverController');

const router = express.Router();

router.use(protect, authorize('driver'));

router.post('/vehicles', registerVehicle);
router.get('/vehicles/mine', getMyVehicles);
router.post('/documents', uploadDocument);
router.get('/documents/mine', getMyDocuments);
router.patch('/availability', setAvailability);
router.patch('/location', updateLocation);
router.patch('/location/stop', stopSharingLocation);
router.get('/wallet', getWallet);

module.exports = router;