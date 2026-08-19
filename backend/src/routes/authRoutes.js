const express = require('express');
const { protect } = require('../middleware/auth');
const {
  loginLimiter,
  registerLimiter,
  otpLimiter,
  passwordResetLimiter,
} = require('../middleware/rateLimit');
const {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  completeProfile,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);

router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.patch('/complete-profile', protect, completeProfile);

module.exports = router;