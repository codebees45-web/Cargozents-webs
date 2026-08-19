const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  reviewShipmentDriver,
  reviewOrderShipper,
  getReviewsForUser,
} = require('../controllers/reviewController');

const router = express.Router();

router.use(protect);

router.post('/shipment/:shipmentId', authorize('shipper'), reviewShipmentDriver);
router.post('/order/:orderId', authorize('buyer'), reviewOrderShipper);
router.get('/user/:userId', getReviewsForUser);

module.exports = router;