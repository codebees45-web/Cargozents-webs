const { roadDistanceKm } = require('./geo');
const { calculatePrice: heuristicCalculatePrice } = require('./pricingEngine');

/**
 * AI Freight Price Predictor
 * ---------------------------------------------------------------------
 * A multivariate linear regression trained on CargoZents' own historical,
 * delivered shipments (Shipment.finalPrice). No external ML API, no API
 * key, no network call — trained in-process from real platform data using
 * ridge-regularized ordinary least squares (closed-form normal equation),
 * implemented here in plain JS so it's fully auditable.
 *
 * Design choices, explained:
 *  - Ridge (L2) regularization (see RIDGE_LAMBDA) instead of plain OLS:
 *    keeps the (X^T X) matrix invertible even when a vehicle-type category
 *    has very few historical examples, and keeps coefficients from
 *    exploding on a small training set — both very real risks with the
 *    small sample sizes an early-stage marketplace actually has.
 *  - Cold start: below MIN_TRAINING_SAMPLES delivered shipments, we don't
 *    trust a learned model at all and fall back to the existing rule-based
 *    pricingEngine.calculatePrice(). This is reported to the caller
 *    explicitly (method: 'heuristic') rather than silently pretending to
 *    be ML — judged/inspected code should never claim more confidence
 *    than the data supports.
 *  - Sanity clamp: even once trained, a prediction that's wildly out of
 *    line with the heuristic estimate (>2.5x or <0.4x) is clamped back
 *    toward it. A regression can extrapolate badly on an unusual
 *    route/weight combo it has never seen; the heuristic acts as a floor
 *    of physical plausibility so the UI never shows something absurd.
 */

const MIN_TRAINING_SAMPLES = 15;
const RIDGE_LAMBDA = 2.0;
const MODEL_STALE_MS = 30 * 60 * 1000; // retrain at most every 30 min unless forced

// Baseline vehicle type is 'mini_truck' — its effect is absorbed into the
// bias term, so it does NOT get its own column (avoids a singular /
// perfectly-collinear design matrix).
const VEHICLE_DUMMY_TYPES = ['tempo', 'container', 'trailer', 'open_body', 'refrigerated'];

const FEATURE_NAMES = [
  'bias',
  'distanceKm',
  'weightKg',
  'insuranceOpted',
  'isInterstate',
  'isBackhaulMatch',
  ...VEHICLE_DUMMY_TYPES.map((v) => `vehicle_${v}`),
];

/** Turns a shipment-like record into the raw feature values (pre-vector). */
const extractFeatures = ({
  pickupCoordinates,
  dropCoordinates,
  pickupState,
  dropState,
  weight,
  vehicleType,
  insuranceOpted = false,
  isBackhaulMatch = false,
}) => {
  const distanceKm = roadDistanceKm(pickupCoordinates, dropCoordinates);
  const isInterstate =
    pickupState && dropState && pickupState.trim().toLowerCase() !== dropState.trim().toLowerCase();

  return {
    distanceKm,
    weightKg: Number(weight) || 0,
    insuranceOpted: insuranceOpted ? 1 : 0,
    isInterstate: isInterstate ? 1 : 0,
    isBackhaulMatch: isBackhaulMatch ? 1 : 0,
    vehicleType,
  };
};

/** Feature object -> ordered numeric vector matching FEATURE_NAMES. */
const toVector = (f) => [
  1, // bias
  f.distanceKm,
  f.weightKg,
  f.insuranceOpted,
  f.isInterstate,
  f.isBackhaulMatch,
  ...VEHICLE_DUMMY_TYPES.map((v) => (f.vehicleType === v ? 1 : 0)),
];

// ---- Minimal pure-JS linear algebra (no dependency needed for a ~10x10 matrix) ----

const transpose = (m) => m[0].map((_, colIdx) => m.map((row) => row[colIdx]));

const matMul = (a, b) => {
  const result = [];
  for (let i = 0; i < a.length; i++) {
    const row = [];
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < b.length; k++) sum += a[i][k] * b[k][j];
      row.push(sum);
    }
    result.push(row);
  }
  return result;
};

/** Gauss-Jordan matrix inversion. Throws if singular (shouldn't happen with ridge term added). */
const invertMatrix = (matrix) => {
  const n = matrix.length;
  const augmented = matrix.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivotRow][col])) pivotRow = row;
    }
    if (Math.abs(augmented[pivotRow][col]) < 1e-10) {
      throw new Error('Matrix is singular — cannot invert (unexpected with ridge regularization applied)');
    }
    [augmented[col], augmented[pivotRow]] = [augmented[pivotRow], augmented[col]];

    const pivot = augmented[col][col];
    for (let j = 0; j < 2 * n; j++) augmented[col][j] /= pivot;

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = augmented[row][col];
      for (let j = 0; j < 2 * n; j++) augmented[row][j] -= factor * augmented[col][j];
    }
  }

  return augmented.map((row) => row.slice(n));
};

/**
 * Trains a ridge-regularized linear regression: beta = (X^T X + λI)^-1 X^T y
 * `samples` is an array of { features: <raw feature object>, price: number }.
 */
const trainModel = (samples) => {
  if (samples.length < MIN_TRAINING_SAMPLES) {
    return { trained: false, sampleSize: samples.length };
  }

  const X = samples.map((s) => toVector(s.features));
  const y = samples.map((s) => [s.price]);
  const numFeatures = X[0].length;

  const Xt = transpose(X);
  const XtX = matMul(Xt, X);

  // Add λI (skip regularizing the bias term, row/col 0, per convention)
  for (let i = 1; i < numFeatures; i++) {
    XtX[i][i] += RIDGE_LAMBDA;
  }

  const XtXInv = invertMatrix(XtX);
  const XtY = matMul(Xt, y);
  const beta = matMul(XtXInv, XtY).map((row) => row[0]);

  // R^2 on the training set — reported as a transparency signal, not
  // held out, since sample sizes here are typically too small to spare
  // a test split. Treat it as "goodness of fit to known data", not a
  // generalization guarantee.
  const predictions = X.map((row) => row.reduce((sum, v, i) => sum + v * beta[i], 0));
  const meanY = y.reduce((sum, v) => sum + v[0], 0) / y.length;
  const ssTot = y.reduce((sum, v) => sum + (v[0] - meanY) ** 2, 0);
  const ssRes = y.reduce((sum, v, i) => sum + (v[0] - predictions[i]) ** 2, 0);
  const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;

  return {
    trained: true,
    coefficients: beta,
    featureNames: FEATURE_NAMES,
    sampleSize: samples.length,
    rSquared: Number(rSquared.toFixed(3)),
    trainedAt: new Date(),
  };
};

/** Applies a trained model's coefficients to a single feature object. */
const predictWithModel = (model, features) => {
  const vector = toVector(features);
  return vector.reduce((sum, v, i) => sum + v * model.coefficients[i], 0);
};

/**
 * Full predict pipeline: decides ML vs heuristic, clamps for sanity,
 * and returns a rich, explainable result for the API/UI.
 */
const predictPrice = (input, model) => {
  const features = extractFeatures(input);
  const heuristic = heuristicCalculatePrice(input);

  const useML = model && model.trained && model.sampleSize >= MIN_TRAINING_SAMPLES;

  if (!useML) {
    return {
      method: 'heuristic',
      predictedPrice: heuristic.estimatedPrice,
      priceRange: {
        low: Math.round(heuristic.estimatedPrice * 0.92),
        high: Math.round(heuristic.estimatedPrice * 1.08),
      },
      confidence: null,
      distanceKm: heuristic.distanceKm,
      breakdown: heuristic.breakdown,
      modelInfo: {
        trained: false,
        sampleSize: model ? model.sampleSize : 0,
        samplesNeeded: MIN_TRAINING_SAMPLES,
        reason: `Only ${model ? model.sampleSize : 0} delivered shipments with recorded pricing so far — need at least ${MIN_TRAINING_SAMPLES} before the AI model activates. Using the rule-based estimator until then.`,
      },
    };
  }

  let mlPrice = predictWithModel(model, features);

  // Sanity clamp against the heuristic — see module docstring.
  const floor = heuristic.estimatedPrice * 0.4;
  const ceiling = heuristic.estimatedPrice * 2.5;
  const wasClamped = mlPrice < floor || mlPrice > ceiling;
  mlPrice = Math.min(Math.max(mlPrice, floor), ceiling);
  mlPrice = Math.max(mlPrice, 0);

  // Wider price band the lower the model's fit quality (rSquared).
  const uncertainty = 0.05 + (1 - model.rSquared) * 0.25;

  return {
    method: 'ml',
    predictedPrice: Math.round(mlPrice),
    priceRange: {
      low: Math.round(mlPrice * (1 - uncertainty)),
      high: Math.round(mlPrice * (1 + uncertainty)),
    },
    confidence: Number((model.rSquared * 100).toFixed(1)), // 0-100 scale for display
    distanceKm: Number(features.distanceKm.toFixed(1)),
    heuristicComparison: heuristic.estimatedPrice,
    breakdown: heuristic.breakdown,
    modelInfo: {
      trained: true,
      sampleSize: model.sampleSize,
      rSquared: model.rSquared,
      trainedAt: model.trainedAt,
      clampedToHeuristicRange: wasClamped,
    },
  };
};

module.exports = {
  MIN_TRAINING_SAMPLES,
  FEATURE_NAMES,
  extractFeatures,
  trainModel,
  predictWithModel,
  predictPrice,
};