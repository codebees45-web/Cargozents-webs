const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

/**
 * Shared JSON response shape for all limiters below, so the frontend
 * gets the same { success, message } contract it gets from every other
 * error path in this API.
 */
const jsonHandler = (message) => (req, res) => {
  res.status(429).json({ success: false, message });
};

/**
 * Keys by the authenticated user's id when available (these limiters
 * are only ever mounted after `protect`, so req.user is set), falling
 * back to IP. Per-user keys are more accurate than per-IP once
 * everyone's authenticated — an office/NAT full of legitimate users
 * sharing one IP won't get lumped into a single bucket. The IP fallback
 * goes through ipKeyGenerator so different textual representations of
 * the same IPv6 address are normalized to the same bucket (see
 * https://express-rate-limit.github.io/ERR_ERL_KEY_GEN_IPV6/).
 */
const byUserOrIp = (req) => req.user?._id?.toString() || ipKeyGenerator(req.ip);

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many login attempts. Please try again in a few minutes.'),
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many signup attempts from this network. Please try again later.'),
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many OTP attempts. Please wait a few minutes before trying again.'),
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 6,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many password reset attempts. Please try again later.'),
});

/**
 * Distance/routing proxy (mapsController.getDistance): each call makes
 * an outbound request to OSRM's free public routing API. That service
 * has its own fair-use limits, and if our server's IP gets hammered
 * hard enough by our own users it risks getting throttled/banned by
 * OSRM for everyone, not just the abusive user. Generous enough for
 * normal "adjust pickup/drop pin a few times" use.
 */
const mapsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: byUserOrIp,
  handler: jsonHandler('Too many distance lookups. Please slow down and try again shortly.'),
});

/**
 * Complaint creation: a low-frequency action for a legitimate user —
 * nobody files dozens of complaints an hour — so this bounds both
 * spam and accidental double-submit loops from flooding the admin
 * queue.
 */
const complaintLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: byUserOrIp,
  handler: jsonHandler('Too many complaints submitted. Please try again later.'),
});

/**
 * Review creation: bounds review-bombing / fake-review spam against a
 * single driver or shipper.
 */
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: byUserOrIp,
  handler: jsonHandler('Too many reviews submitted. Please try again later.'),
});

/**
 * Order creation (freight bookings + product/cart orders): generous
 * enough for a busy legitimate business placing many real orders, but
 * bounds automated/abusive mass order creation, which would otherwise
 * spam shippers/drivers with fake bookings and load up the DB.
 */
const orderCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: byUserOrIp,
  handler: jsonHandler('Too many orders created in a short time. Please try again shortly.'),
});

module.exports = {
  loginLimiter,
  registerLimiter,
  otpLimiter,
  passwordResetLimiter,
  mapsLimiter,
  complaintLimiter,
  reviewLimiter,
  orderCreateLimiter,
};