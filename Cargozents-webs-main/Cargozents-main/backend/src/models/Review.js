const mongoose = require('mongoose');

// A single review always points at exactly one completed transaction —
// either a delivered Shipment (shipper rating the driver who carried it)
// or a delivered Order (buyer rating the shipper who fulfilled it).
// Keeping both in one collection (rather than two near-identical models)
// keeps the "has this user already reviewed this transaction" check and
// the profile-aggregation job in one place.
const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    revieweeRole: {
      type: String,
      enum: ['driver', 'shipper'],
      required: true,
    },

    // Exactly one of these is set, matching revieweeRole.
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
      default: null,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  { timestamps: true }
);

// One review per reviewer per transaction. Sparse so the partial index
// doesn't choke on the field that's null for the other review type.
reviewSchema.index({ shipment: 1, reviewer: 1 }, { unique: true, sparse: true });
reviewSchema.index({ order: 1, reviewer: 1 }, { unique: true, sparse: true });
reviewSchema.index({ reviewee: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);