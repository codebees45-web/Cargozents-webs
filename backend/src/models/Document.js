const mongoose = require('mongoose');

// Generic verification document — covers a driver's license/selfie as well
// as a vehicle's RC/permit/insurance/photos. Kept as one collection (rather
// than duplicating upload+review fields on User and Vehicle) so the admin
// verification queue and expiry-alert job can query across both with a
// single find().
const documentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null, // null for driver-level docs (license, selfie)
    },
    type: {
      type: String,
      enum: ['driving_license', 'selfie', 'rc', 'permit', 'insurance', 'vehicle_photo'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true, // uploaded client-side to Cloudinary; backend stores the resulting URL
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
    expiryDate: { type: Date, default: null }, // RC/permit/insurance/license expiry, if applicable

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

documentSchema.index({ owner: 1, type: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Document', documentSchema);
