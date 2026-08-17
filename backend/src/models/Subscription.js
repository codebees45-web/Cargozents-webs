const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    shipper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      required: true,
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    amount: {
      // amount actually paid, in INR (0 for free plan)
      type: Number,
      required: true,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      // null for the free plan (never expires)
      type: Date,
      default: null,
    },

    // Razorpay references for the payment that activated this record.
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

// A shipper's most relevant subscription is their most recent one.
subscriptionSchema.index({ shipper: 1, createdAt: -1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);