const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");

const paymentController = require("../controllers/paymentController");

router.post(
  "/:orderId/create",
  protect,
  paymentController.createPayment
);

router.post(
  "/verify",
  protect,
  paymentController.verifyPayment
);

module.exports = router;