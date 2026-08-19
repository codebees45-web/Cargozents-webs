const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth");

const mapsController = require("../controllers/mapsController");

router.post(
  "/distance",
  protect,
  mapsController.getDistance
);

module.exports = router;