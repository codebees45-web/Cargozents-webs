const mongoose = require('mongoose');

/**
 * Persists the most recently trained AI Price Predictor model so the
 * server doesn't need to retrain from scratch on every restart, and so
 * admins can see training history / audit what the model learned.
 * Singleton-style: we always upsert the doc with slug 'current', plus
 * keep a rolling history of past versions for comparison.
 */
const priceModelSchema = new mongoose.Schema(
  {
    slug: { type: String, default: 'current', unique: true, index: true },
    coefficients: { type: [Number], required: true },
    featureNames: { type: [String], required: true },
    sampleSize: { type: Number, required: true },
    rSquared: { type: Number, required: true },
    trainedAt: { type: Date, required: true },
    trainedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PriceModel', priceModelSchema);