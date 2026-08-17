const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createShipment,
  getMyShipments,
  getAssignedShipments,
  getAgencyShipments,
  getShipmentById,
  respondToAssignment,
  advanceShipmentStatus,
  getMatchesForShipment,
  assignShipment,
  getShipmentTracking,
} = require('../controllers/shipmentController');

const router = express.Router();

router.use(protect);

router.post('/', authorize('shipper'), createShipment);
router.get('/mine', authorize('shipper'), getMyShipments);
router.get('/assigned-to-me', authorize('driver'), getAssignedShipments);
router.get('/agency-fleet', authorize('agency'), getAgencyShipments);
router.get('/:id/matches', authorize('admin'), getMatchesForShipment);
router.get('/:id/track', getShipmentTracking);
router.patch('/:id/assign', authorize('admin'), assignShipment);
router.patch('/:id/respond', authorize('driver'), respondToAssignment);
router.patch('/:id/status', authorize('driver'), advanceShipmentStatus);
router.get('/:id', getShipmentById);

module.exports = router;