const mongoose = require('mongoose');

// A single broadcast record. Rather than fanning out a copy per recipient,
// each doc represents one announcement plus who it's for — recipients query
// by their own role (or 'all') to build their feed.
const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 1000,
    },
    audience: {
      type: String,
      enum: ['all', 'buyer', 'shipper', 'driver', 'agency'],
      default: 'all',
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ audience: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);