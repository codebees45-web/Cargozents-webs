const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['buyer', 'shipper', 'driver', 'agency', 'admin'],
      required: true,
      default: 'buyer',
    },

    buyerProfile: {
      deliveryAddress: {
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
      },
      alternatePhone: { type: String, default: '' },
    },

    shipperMode: {
      type: String,
      enum: ['catalog', 'raw_shipment', 'both'],
      default: undefined,
    },
    shipperProfile: {
      pickupAddress: {
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
        location: {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: { type: [Number], default: [0, 0] },
        },
      },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      reviewsCount: { type: Number, default: 0 },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false },
      attempts: { type: Number, default: 0, select: false },
      lastSentAt: { type: Date, select: false },
    },

    agencyProfile: {
      companyName: { type: String, default: '' },
      gstNumber: { type: String, default: '' },
      address: {
        line1: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
      },
      fleetSize: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      reviewsCount: { type: Number, default: 0 },
    },

    driverProfile: {
      licenseNumber: { type: String, default: '' },
      licensePhoto: { type: String, default: '' },
      idProofPhoto: { type: String, default: '' },
      currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
      locationUpdatedAt: { type: Date, default: null },
      isAvailable: { type: Boolean, default: false },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      reviewsCount: { type: Number, default: 0 },
      agency: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },

    profileImage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

userSchema.index({ 'driverProfile.currentLocation': '2dsphere' });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);