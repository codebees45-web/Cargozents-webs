const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const logger = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');
const { sendWhatsApp } = require('../utils/whatsappClient');

// ---- Config ----
const OTP_TTL_MS = 10 * 60 * 1000;        // OTP valid for 10 minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60s between OTP resends
const OTP_MAX_ATTEMPTS = 5;               // lock after 5 wrong tries

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10,15}$/;

// Generates a 6-digit numeric OTP, valid for OTP_TTL_MS.
const createOtp = () => ({
  code: String(Math.floor(100000 + Math.random() * 900000)),
  expiresAt: new Date(Date.now() + OTP_TTL_MS),
  attempts: 0,
  lastSentAt: new Date(),
});

/**
 * POST /api/auth/register
 * Body: { name, email, phone, password, role, shipperMode? }
 */
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, shipperMode, agencyProfile } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (!PHONE_REGEX.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const allowedRoles = ['buyer', 'shipper', 'driver', 'agency', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${allowedRoles.join(', ')}` });
    }

    if (role === 'shipper' && !shipperMode) {
      return res.status(400).json({
        success: false,
        message: 'shipperMode is required for shipper accounts (catalog, raw_shipment, or both)',
      });
    }
    if (role === 'agency' && !agencyProfile?.companyName) {
      return res.status(400).json({
        success: false,
        message: 'agencyProfile.companyName is required for agency accounts',
      });
    }

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email or phone already registered' });
    }

    const otp = createOtp();

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      shipperMode: role === 'shipper' ? shipperMode : undefined,
      agencyProfile:
        role === 'agency'
          ? {
              companyName: agencyProfile.companyName,
              gstNumber: agencyProfile.gstNumber || '',
              address: agencyProfile.address || {},
            }
          : undefined,
      otp,
      isVerified: false,
      isSuspended: false,
    });

    if (process.env.NODE_ENV !== 'production') {
      logger.info(`OTP for ${phone}: ${otp.code}`); // keep for dev visibility
    }
    await sendEmail({
      to: email,
      subject: 'Your CargoZent OTP',
      text: `Your CargoZent OTP for account verification is ${otp.code}. It expires in 10 minutes.`,
    });

    // WhatsApp expects international format without '+' or leading zeros.
    // Assumes 10-digit Indian numbers; prefixes 91 if no country code present.
    const whatsappPhone = phone.length === 10 ? `91${phone}` : phone;
    sendWhatsApp(
      whatsappPhone,
      `Your CargoZent OTP for account verification is *${otp.code}*. It expires in 10 minutes.`
    ); // not awaited on purpose — don't block registration response if WhatsApp is slow/not ready

    res.status(201).json({
      success: true,
      message: 'Registered successfully. OTP sent for verification.',
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/verify-otp
 * Body: { userId, otp }
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'userId and otp are required' });
    }

    const user = await User.findById(userId).select('+otp.code +otp.expiresAt +otp.attempts');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User already verified' });
    }
    if (!user.otp) {
      return res.status(400).json({ success: false, message: 'No OTP requested. Please register or resend OTP.' });
    }
    if (user.otp.attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
    }
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (user.otp.code !== otp) {
      user.otp.attempts = (user.otp.attempts || 0) + 1;
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);
    res.status(200).json({
      success: true,
      message: 'Account verified',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shipperMode: user.shipperMode,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/resend-otp
 * Body: { userId }
 * Re-issues a fresh OTP, throttled by OTP_RESEND_COOLDOWN_MS.
 */
const resendOtp = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const user = await User.findById(userId).select('+otp.lastSentAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User already verified' });
    }

    if (user.otp?.lastSentAt) {
      const elapsed = Date.now() - new Date(user.otp.lastSentAt).getTime();
      if (elapsed < OTP_RESEND_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds}s before requesting another OTP`,
        });
      }
    }

    const otp = createOtp();
    user.otp = otp;
    await user.save();

    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Resent OTP for ${user.phone}: ${otp.code}`);
    }
    await sendEmail({
      to: user.email,
      subject: 'Your CargoZent OTP',
      text: `Your CargoZent OTP for account verification is ${otp.code}. It expires in 10 minutes.`,
    });
    res.status(200).json({ success: true, message: 'OTP resent successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please verify OTP first.',
        userId: user._id,
        email: user.email,
        phone: user.phone,
      });
    }
    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shipperMode: user.shipperMode,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email }).select('+otp.lastSentAt');
    if (!user) {
      // Don't leak whether the email exists
      return res.status(200).json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    }

    if (user.otp?.lastSentAt) {
      const elapsed = Date.now() - new Date(user.otp.lastSentAt).getTime();
      if (elapsed < OTP_RESEND_COOLDOWN_MS) {
        // Still respond generically to avoid leaking account state
        return res.status(200).json({ success: true, message: 'If that email exists, an OTP has been sent.' });
      }
    }

    const otp = createOtp();
    user.otp = otp;
    await user.save();

    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Password reset OTP for ${email}: ${otp.code}`);
    }
    await sendEmail({
      to: email,
      subject: 'Your CargoZent Password Reset OTP',
      text: `Your CargoZent OTP for password reset is ${otp.code}. It expires in 10 minutes.`,
    });
    res.status(200).json({ success: true, message: 'If that email exists, an OTP has been sent.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password
 * Body: { email, otp, newPassword }
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'email, otp and newPassword are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt +otp.attempts +password');

    if (!user || !user.otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    if (user.otp.attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
    }
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    if (user.otp.code !== otp) {
      user.otp.attempts = (user.otp.attempts || 0) + 1;
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword; // pre-save hook rehashes
    user.otp = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. Please log in.' });
  } catch (err) {
    next(err);
  }
};

/** GET /api/auth/me */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/auth/me
 * Updates the logged-in user's own editable profile fields. Role, verification,
 * and approval flags are intentionally never editable through this endpoint.
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, profileImage, shipperMode, shipperProfile, agencyProfile } = req.body;

    // 🚀 FIX: Load full Mongoose document to prevent "markModified is not a function"
    const dbUser = await User.findById(req.user._id);
    if (!dbUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) dbUser.name = name;
    if (profileImage !== undefined) dbUser.profileImage = profileImage;

    if (dbUser.role === 'shipper') {
      if (shipperMode !== undefined) dbUser.shipperMode = shipperMode;
      if (shipperProfile?.pickupAddress) {
        const currentSnapshot = dbUser.shipperProfile?.toObject ? dbUser.shipperProfile.toObject() : (dbUser.shipperProfile || {});
        const current = currentSnapshot.pickupAddress || {};
        dbUser.shipperProfile.pickupAddress = {
          address: shipperProfile.pickupAddress.address ?? current.address ?? '',
          city: shipperProfile.pickupAddress.city ?? current.city ?? '',
          state: shipperProfile.pickupAddress.state ?? current.state ?? '',
          pincode: shipperProfile.pickupAddress.pincode ?? current.pincode ?? '',
          location: shipperProfile.pickupAddress.location ?? current.location ?? { type: 'Point', coordinates: [0, 0] },
        };
      }
      dbUser.markModified('shipperProfile');
    }
    
    if (dbUser.role === 'agency' && agencyProfile) {
      const current = dbUser.agencyProfile || {};
      dbUser.agencyProfile = {
        companyName: agencyProfile.companyName ?? current.companyName ?? '',
        gstNumber: agencyProfile.gstNumber ?? current.gstNumber ?? '',
        address: {
          line1: agencyProfile.address?.line1 ?? current.address?.line1 ?? '',
          city: agencyProfile.address?.city ?? current.address?.city ?? '',
          state: agencyProfile.address?.state ?? current.address?.state ?? '',
          pincode: agencyProfile.address?.pincode ?? current.address?.pincode ?? '',
        },
        fleetSize: current.fleetSize ?? 0,
        rating: current.rating ?? 0,
        reviewsCount: current.reviewsCount ?? 0,
      };
      dbUser.markModified('agencyProfile');
    }

    await dbUser.save();
    res.status(200).json({ success: true, user: dbUser });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/auth/complete-profile
 * Executed during onboarding steps to lock in profile fields.
 */
const completeProfile = async (req, res, next) => {
  try {
    const { profileImage, buyerProfile, shipperProfile, driverProfile, agencyProfile } = req.body;

    // 🚀 FIX: Load full Mongoose document to prevent "markModified is not a function"[cite: 8]
    const dbUser = await User.findById(req.user._id);
    if (!dbUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (profileImage !== undefined) dbUser.profileImage = profileImage;

    if (dbUser.role === 'buyer' && buyerProfile) {
      dbUser.buyerProfile = {
        deliveryAddress: {
          address: buyerProfile.deliveryAddress?.address || '',
          city: buyerProfile.deliveryAddress?.city || '',
          state: buyerProfile.deliveryAddress?.state || '',
          pincode: buyerProfile.deliveryAddress?.pincode || '',
        },
        alternatePhone: buyerProfile.alternatePhone || '',
      };
      dbUser.markModified('buyerProfile');
    }

    if (dbUser.role === 'shipper' && shipperProfile) {
      const current = dbUser.shipperProfile?.toObject ? dbUser.shipperProfile.toObject() : (dbUser.shipperProfile || {});
      dbUser.shipperMode = shipperProfile.shipperMode || dbUser.shipperMode;
      dbUser.shipperProfile.pickupAddress = {
        address: shipperProfile.pickupAddress?.address || current.pickupAddress?.address || '',
        city: shipperProfile.pickupAddress?.city || current.pickupAddress?.city || '',
        state: shipperProfile.pickupAddress?.state || current.pickupAddress?.state || '',
        pincode: shipperProfile.pickupAddress?.pincode || current.pickupAddress?.pincode || '',
        location: current.pickupAddress?.location || { type: 'Point', coordinates: [0, 0] },
      };
      dbUser.markModified('shipperProfile');
    }

    if (dbUser.role === 'driver' && driverProfile) {
      const current = dbUser.driverProfile || {};
      dbUser.driverProfile.licenseNumber = driverProfile.licenseNumber || current.licenseNumber || '';
      dbUser.driverProfile.licensePhoto = driverProfile.licensePhoto || current.licensePhoto || '';
      dbUser.driverProfile.idProofPhoto = driverProfile.idProofPhoto || current.idProofPhoto || '';
      dbUser.markModified('driverProfile');
    }

    if (dbUser.role === 'agency' && agencyProfile) {
      const current = dbUser.agencyProfile || {};
      dbUser.agencyProfile = {
        companyName: agencyProfile.companyName || current.companyName || '',
        gstNumber: agencyProfile.gstNumber || current.gstNumber || '',
        address: {
          line1: agencyProfile.address?.line1 || current.address?.line1 || '',
          city: agencyProfile.address?.city || current.address?.city || '',
          state: agencyProfile.address?.state || current.address?.state || '',
          pincode: agencyProfile.address?.pincode || current.address?.pincode || '',
        },
        fleetSize: current.fleetSize || 0,
        rating: current.rating || 0,
        reviewsCount: current.reviewsCount || 0,
      };
      dbUser.markModified('agencyProfile');
    }

    dbUser.isProfileComplete = true;
    await dbUser.save(); // Save works flawlessly now![cite: 8]

    res.status(200).json({ success: true, user: dbUser });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  completeProfile,
};