const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getPlans,
  getMySubscription,
  createOrder,
  verifyPayment,
  cancelSubscription,
} = require('../controllers/subscriptionController');

const router = express.Router();

// All subscription routes are shipper-only.
router.use(protect, authorize('shipper'));

router.get('/plans', getPlans);
router.get('/me', getMySubscription);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/cancel', cancelSubscription);

module.exports = router;