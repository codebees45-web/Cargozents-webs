const express = require("express");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

const pricingController = require("../controllers/pricingController");
const aiPricingController = require("../controllers/aiPricingController");

// Existing rule-based calculator (unchanged)
router.post(
  "/calculate",
  protect,
  pricingController.calculatePrice
);

// AI Price Predictor — any authenticated user (shipper/buyer/agency) can
// request a prediction while booking.
router.post("/predict", protect, aiPricingController.predict);

// Admin-only model management
router.post("/ai/retrain", protect, authorize("admin"), aiPricingController.retrainNow);
router.get("/ai/stats", protect, authorize("admin"), aiPricingController.getStats);

module.exports = router;