const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getShipmentList, getShipmentSummary } = require('../controllers/shipmentAnalyticsController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/summary', getShipmentSummary);
router.get('/', getShipmentList);

module.exports = router;