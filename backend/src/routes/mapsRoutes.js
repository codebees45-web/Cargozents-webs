const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth");

const mapsController = require("../controllers/mapsController");

router.post(
  "/distance",
  protect,
  mapsController.getDistance
);

// Public — no auth needed (used on signup & unauthenticated pages too)
router.get("/autocomplete", mapsController.placesAutocomplete);
router.get("/place-details", mapsController.placeDetails);

module.exports = router;