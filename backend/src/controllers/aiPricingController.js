const Shipment = require('../models/Shipment');
const PriceModel = require('../models/PriceModel');
const {
  MIN_TRAINING_SAMPLES,
  extractFeatures,
  trainModel,
  predictPrice,
} = require('../utils/mlPricingEngine');

const STALE_MS = 30 * 60 * 1000; // auto-retrain at most every 30 minutes

// In-process cache so we don't hit Mongo/retrain on every single predict
// call. Seeded from the persisted PriceModel doc on first use after a
// server restart.
let cachedModel = null;
let cachedAt = 0;

/** Pulls delivered shipments with a real recorded price and shapes them into training samples. */
const buildTrainingSamples = async () => {
  const shipments = await Shipment.find({
    status: 'delivered',
    finalPrice: { $exists: true, $gt: 0 },
  })
    .select('weight vehicleRequired insuranceOpted isBackhaulMatch pickup drop finalPrice')
    .lean();

  const samples = [];
  for (const s of shipments) {
    const pickupCoords = s.pickup?.location?.coordinates;
    const dropCoords = s.drop?.location?.coordinates;

    // Skip records with no real geo data (default [0,0] placeholder, or missing)
    const hasPickup = Array.isArray(pickupCoords) && (pickupCoords[0] !== 0 || pickupCoords[1] !== 0);
    const hasDrop = Array.isArray(dropCoords) && (dropCoords[0] !== 0 || dropCoords[1] !== 0);
    if (!hasPickup || !hasDrop) continue;

    samples.push({
      features: extractFeatures({
        pickupCoordinates: pickupCoords,
        dropCoordinates: dropCoords,
        pickupState: s.pickup?.state,
        dropState: s.drop?.state,
        weight: s.weight,
        vehicleType: s.vehicleRequired,
        insuranceOpted: s.insuranceOpted,
        isBackhaulMatch: s.isBackhaulMatch,
      }),
      price: s.finalPrice,
    });
  }
  return samples;
};

/** Trains, persists, and caches a fresh model. Returns the trained model object (or { trained: false, ... }). */
const retrain = async (trainedBy = null) => {
  const samples = await buildTrainingSamples();
  const model = trainModel(samples);

  if (model.trained) {
    await PriceModel.findOneAndUpdate(
      { slug: 'current' },
      {
        slug: 'current',
        coefficients: model.coefficients,
        featureNames: model.featureNames,
        sampleSize: model.sampleSize,
        rSquared: model.rSquared,
        trainedAt: model.trainedAt,
        trainedBy,
      },
      { upsert: true, new: true }
    );
  }

  cachedModel = model;
  cachedAt = Date.now();
  return model;
};

/** Returns a usable model: from cache, else from Mongo, else trains fresh. Never throws on cold start. */
const getOrTrainModel = async () => {
  if (cachedModel && Date.now() - cachedAt < STALE_MS) {
    return cachedModel;
  }

  if (!cachedModel) {
    // Try to hydrate from the persisted doc first (cheap, avoids a
    // full retrain on every server restart).
    const persisted = await PriceModel.findOne({ slug: 'current' }).lean();
    if (persisted) {
      cachedModel = {
        trained: true,
        coefficients: persisted.coefficients,
        featureNames: persisted.featureNames,
        sampleSize: persisted.sampleSize,
        rSquared: persisted.rSquared,
        trainedAt: persisted.trainedAt,
      };
      cachedAt = Date.now();
      return cachedModel;
    }
  }

  // Nothing cached, nothing persisted, or stale — retrain now.
  return retrain();
};


/** POST /api/pricing/predict — Body: shipment-shaped fields; returns AI (or heuristic-fallback) price. */
const predict = async (req, res, next) => {
  try {
    const {
      pickupCoordinates,
      dropCoordinates,
      pickupState,
      dropState,
      weight,
      vehicleType,
      insuranceOpted,
      isBackhaulMatch,
    } = req.body;

    if (
      !Array.isArray(pickupCoordinates) ||
      !Array.isArray(dropCoordinates) ||
      pickupCoordinates.length !== 2 ||
      dropCoordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: 'pickupCoordinates and dropCoordinates are required as [lng, lat] pairs',
      });
    }
    if (!weight || Number(weight) <= 0) {
      return res.status(400).json({ success: false, message: 'weight (kg) is required and must be > 0' });
    }
    if (!vehicleType) {
      return res.status(400).json({ success: false, message: 'vehicleType is required' });
    }

    const model = await getOrTrainModel();
    const result = predictPrice(
      {
        pickupCoordinates,
        dropCoordinates,
        pickupState,
        dropState,
        weight,
        vehicleType,
        insuranceOpted,
        isBackhaulMatch,
      },
      model
    );

    res.status(200).json({ success: true, prediction: result });
  } catch (err) {
    next(err);
  }
};

/** POST /api/pricing/ai/retrain — admin only. Forces a fresh training run. */
const retrainNow = async (req, res, next) => {
  try {
    const model = await retrain(req.user?._id || null);
    res.status(200).json({
      success: true,
      model: model.trained
        ? {
            trained: true,
            sampleSize: model.sampleSize,
            rSquared: model.rSquared,
            trainedAt: model.trainedAt,
          }
        : { trained: false, sampleSize: model.sampleSize, samplesNeeded: MIN_TRAINING_SAMPLES },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/pricing/ai/stats — admin only. Current model status without retraining. */
const getStats = async (req, res, next) => {
  try {
    const model = await getOrTrainModel();
    res.status(200).json({
      success: true,
      model: model.trained
        ? {
            trained: true,
            sampleSize: model.sampleSize,
            rSquared: model.rSquared,
            trainedAt: model.trainedAt,
            featureNames: model.featureNames,
            coefficients: model.coefficients,
          }
        : { trained: false, sampleSize: model.sampleSize, samplesNeeded: MIN_TRAINING_SAMPLES },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { predict, retrainNow, getStats };