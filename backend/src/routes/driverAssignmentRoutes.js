const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const controller = require("../controllers/driverAssignmentController");

router.post(
  "/:orderId",
  auth,
  controller.assignDriver
);

module.exports = router;