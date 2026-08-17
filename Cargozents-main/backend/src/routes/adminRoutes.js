const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDrivers,
  verifyDriver,
  suspendDriver,
  getVehicles,
  verifyVehicle,
  getDocuments,
  reviewDocument,
  getShipments,
  getAnalyticsOverview,
  getAnalyticsTrend,
  bulkVerifyDrivers,
  bulkVerifyVehicles,
  bulkReviewDocuments,
  getUsers,
  suspendUser,
  createBroadcast,
  getBroadcasts,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/suspend', suspendUser);

router.post('/notifications', createBroadcast);
router.get('/notifications', getBroadcasts);

router.get('/drivers', getDrivers);
router.patch('/drivers/:id/verify', verifyDriver);
router.patch('/drivers/:id/suspend', suspendDriver);
router.patch('/drivers/bulk-verify', bulkVerifyDrivers);

router.get('/vehicles', getVehicles);
router.patch('/vehicles/:id/verify', verifyVehicle);
router.patch('/vehicles/bulk-verify', bulkVerifyVehicles);

router.get('/documents', getDocuments);
router.patch('/documents/:id/review', reviewDocument);
router.patch('/documents/bulk-review', bulkReviewDocuments);

router.get('/shipments', getShipments);

router.get('/analytics/overview', getAnalyticsOverview);
router.get('/analytics/trend', getAnalyticsTrend);

module.exports = router;