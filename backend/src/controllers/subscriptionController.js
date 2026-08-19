const crypto = require('crypto');
const Razorpay = require('razorpay');
const Subscription = require('../models/Subscription');
const PLANS = require('../config/plans');
const logger = require('../utils/logger');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * GET /api/subscriptions/plans
 * Public-ish (still requires login, but no role restriction) — returns
 * the static plan catalogue so the frontend never hardcodes prices.
 */
const getPlans = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, plans: Object.values(PLANS) });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/subscriptions/me
 * Returns the shipper's current (most recent) subscription.
 * If none exists yet, treats them as being on the free plan implicitly.
 */
const getMySubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ shipper: req.user._id }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(200).json({
        success: true,
        subscription: { plan: 'free', status: 'active', expiresAt: null },
      });
    }

    // Auto-expire: if a paid plan's date has passed, report it as expired
    // rather than silently continuing to grant paid features.
    if (subscription.expiresAt && subscription.expiresAt < new Date() && subscription.status === 'active') {
      subscription.status = 'expired';
      await subscription.save();
    }

    res.status(200).json({ success: true, subscription });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/subscriptions/create-order
 * Body: { plan: 'basic' | 'premium' }
 * Creates a Razorpay order for the chosen paid plan. The frontend opens
 * Razorpay Checkout with the returned order — no money moves until the
 * user completes payment there, and no subscription record is created yet.
 */
const createOrder = async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!plan || !['basic', 'premium'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'plan must be "basic" or "premium"' });
    }

    const planDetails = PLANS[plan];

    const order = await razorpay.orders.create({
      amount: planDetails.price * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `sub_${req.user._id.toString().slice(-10)}_${Date.now().toString().slice(-8)}`, // stays under Razorpay's 40-char receipt limit
      notes: { shipperId: req.user._id.toString(), plan },
    });

    res.status(201).json({
      success: true,
      order,
      plan: planDetails,
      keyId: process.env.RAZORPAY_KEY_ID, // safe to expose — it's the public key
    });
  } catch (err) {
    const razorpayReason = err?.error?.description || err?.message || JSON.stringify(err);
    logger.error(`Razorpay order creation failed: ${razorpayReason}`);
    return res.status(400).json({ success: false, message: `Razorpay error: ${razorpayReason}` });
  }
};

/**
 * POST /api/subscriptions/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan }
 * Called by the frontend after Razorpay Checkout succeeds. Verifies the
 * payment signature server-side (never trust the client alone) before
 * activating the subscription.
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    if (!['basic', 'premium'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'plan must be "basic" or "premium"' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      logger.error(`Razorpay signature mismatch for order ${razorpay_order_id}`);
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const planDetails = PLANS[plan];
    const expiresAt = new Date(Date.now() + planDetails.durationDays * 24 * 60 * 60 * 1000);

    const subscription = await Subscription.create({
      shipper: req.user._id,
      plan,
      status: 'active',
      amount: planDetails.price,
      startedAt: new Date(),
      expiresAt,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    logger.info(`Subscription activated: shipper ${req.user._id} -> ${plan}`);

    res.status(201).json({ success: true, message: 'Subscription activated', subscription });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/subscriptions/cancel
 * Marks the current active subscription as cancelled. Access to paid
 * features should be checked against status==='active' && !expired.
 */
const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ shipper: req.user._id, status: 'active' }).sort({
      createdAt: -1,
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'No active subscription to cancel' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.status(200).json({ success: true, message: 'Subscription cancelled', subscription });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPlans,
  getMySubscription,
  createOrder,
  verifyPayment,
  cancelSubscription,
};