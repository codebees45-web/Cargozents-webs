const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth");

const orderController = require("../controllers/orderController");
const validateOrder = require("../middleware/validateOrder");
const validateProductOrder = require("../middleware/validateProductOrder");

/*
|--------------------------------------------------------------------------
| Buyer Routes
|--------------------------------------------------------------------------
*/

// Create Order (freight / Book Shipment flow)
router.post(
  "/",
  protect,
  validateOrder,
  orderController.createOrder
);

// Create Product Order (Shop / Cart / Checkout flow)
router.post(
  "/product",
  protect,
  validateProductOrder,
  orderController.createProductOrder
);

// Get Logged-in User Orders
router.get(
  "/my-orders",
  protect,
  orderController.getMyOrders
);

/*
|--------------------------------------------------------------------------
| Shipper Routes
|--------------------------------------------------------------------------
| Registered before the generic "/:id" route below so that "/received"
| isn't swallowed by it (Express matches routes in declaration order).
*/

// Get Orders Received (product orders placed against this shipper's catalog)
router.get(
  "/received",
  protect,
  orderController.getReceivedOrders
);

// Confirm Order (shipper confirms a newly placed product order)
router.patch(
  "/:id/confirm",
  protect,
  orderController.confirmOrder
);

// Reject Order (shipper/agency declines a newly placed product order)
router.patch(
  "/:id/reject",
  protect,
  orderController.rejectOrder
);

// Assign Truck (shipper/agency assigns one of their own vehicles)
router.patch(
  "/:id/assign-truck",
  protect,
  orderController.assignTruck
);

// Order Tracking (status timeline + live vehicle position if assigned)
router.get(
  "/:id/tracking",
  protect,
  orderController.getOrderTracking
);

// Get Single Order
router.get(
  "/:id",
  protect,
  orderController.getOrderById
);

// Cancel Order
router.patch(
  "/:id/cancel",
  protect,
  orderController.cancelOrder
);

/*
|--------------------------------------------------------------------------
| Driver/Admin Routes
|--------------------------------------------------------------------------
*/

// Assign Driver
router.patch(
  "/:id/assign-driver",
  protect,
  orderController.assignDriver
);

// Update Status
router.patch(
  "/:id/status",
  protect,
  orderController.updateOrderStatus
);

// Generate Delivery OTP
router.post(
  "/:id/generate-otp",
  protect,
  orderController.generateOTP
);

module.exports = router;