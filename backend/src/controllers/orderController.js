const Order = require("../models/Order");
const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");
const { resolveCoupon } = require("../config/coupons");

/**
 * Create Order (freight / "Book Shipment" flow)
 */
exports.createOrder = async (req, res) => {
  try {
    const orderId = `CGZ-${Date.now()}`;

    const order = await Order.create({
      orderId,
      buyer: req.user._id,
      orderType: "shipment",

      pickup: req.body.pickup,
      delivery: req.body.delivery,

      goods: req.body.goods,

      vehicle: req.body.vehicle,

      shipment: req.body.shipment,

      pricing: req.body.pricing,

      documents: req.body.documents || [],

      tracking: {
        currentStatus: "Submitted",
        timeline: [
          {
            status: "Submitted",
            message: "Order created successfully",
            createdAt: new Date(),
          },
        ],
      },
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Create Product Order (Shop / Cart / Checkout flow)
 *
 * Prices and stock are re-read from the database rather than trusted from
 * the client, and all items in the cart must belong to the same shipper
 * (a cart only ever holds one shipper's products at a time on the frontend).
 */
exports.createProductOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, productPaymentMethod, couponCode } = req.body;

    const productIds = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more products in your cart could not be found",
      });
    }

    const shipperIds = new Set(products.map((p) => p.shipper.toString()));
    if (shipperIds.size > 1) {
      return res.status(400).json({
        success: false,
        message: "All items in an order must be from the same shipper",
      });
    }

    const productsById = new Map(products.map((p) => [p._id.toString(), p]));

    let productTotal = 0;
    const orderItems = [];

    for (const { product: productId, quantity } of items) {
      const product = productsById.get(productId);

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `"${product.name}" is no longer available`,
        });
      }
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} of "${product.name}" left in stock`,
        });
      }

      productTotal += product.price * quantity;
      orderItems.push({
        product: product._id,
        quantity,
        priceAtPurchase: product.price,
      });
    }

    const orderId = `CGZ-${Date.now()}`;

    const applied = resolveCoupon(couponCode, productTotal);
    const discountAmount = applied ? applied.discountAmount : 0;
    const finalTotal = Math.max(productTotal - discountAmount, 0);

    const order = await Order.create({
      orderId,
      buyer: req.user._id,
      shipper: products[0].shipper,
      orderType: "product",

      items: orderItems,
      productSubtotal: productTotal,
      discountAmount,
      couponCode: applied ? applied.code : null,
      productTotal: finalTotal,
      deliveryAddress,
      productPaymentMethod,
      productPaymentStatus: productPaymentMethod === "cod" ? "pending" : "pending",

      status: "placed",
    });

    // Best-effort stock decrement — not wrapped in a transaction since this
    // project doesn't run Mongo as a replica set locally, but good enough
    // for the current single-shipper-per-order flow.
    await Promise.all(
      orderItems.map((i) =>
        Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } })
      )
    );

    const populatedOrder = await Order.findById(order._id).populate(
      "items.product"
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get Logged-in User Orders
 * Optional ?type=product|shipment query param to filter by order type.
 */
exports.getMyOrders = async (req, res) => {
  try {
    const filter = { buyer: req.user._id };
    if (req.query.type === "product" || req.query.type === "shipment") {
      filter.orderType = req.query.type;
    }

    const orders = await Order.find(filter)
      .populate("driver", "name phone")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get Orders Received (shipper's product-catalog orders)
 * Any product order whose items belong to the logged-in shipper.
 */
exports.getReceivedOrders = async (req, res) => {
  try {
    const filter = { shipper: req.user._id, orderType: "product" };

    const orders = await Order.find(filter)
      .populate("buyer", "name email phone")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Confirm Order (shipper confirms a newly placed product order)
 */
exports.confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.shipper || !order.shipper.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to confirm this order",
      });
    }

    if (order.status !== "placed") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be confirmed from status "${order.status}"`,
      });
    }

    order.status = "confirmed_by_shipper";
    order.tracking.timeline.push({
      status: "Confirmed",
      message: "Order confirmed by shipper",
      createdAt: new Date(),
    });
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("buyer", "name email phone")
      .populate("items.product");

    res.json({
      success: true,
      message: "Order confirmed",
      order: populatedOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Reject Order (shipper/agency declines a newly placed product order)
 */
exports.rejectOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.shipper || !order.shipper.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reject this order",
      });
    }

    if (order.status !== "placed") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be rejected from status "${order.status}"`,
      });
    }

    order.status = "cancelled";
    order.tracking.timeline.push({
      status: "Cancelled",
      message: req.body?.reason
        ? `Rejected by shipper: ${req.body.reason}`
        : "Rejected by shipper",
      createdAt: new Date(),
    });

    await order.save();

    res.json({
      success: true,
      message: "Order rejected",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Assign Truck (shipper/agency assigns one of their own vehicles, from the
 * Vehicle collection, to a confirmed order). Mirrors assignDriver below but
 * scoped to the requesting shipper's own fleet, and also copies the
 * driver riding that truck (if any) onto the order in one step.
 */
exports.assignTruck = async (req, res) => {
  try {
    const { vehicleId } = req.body;

    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "vehicleId is required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.shipper || !order.shipper.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to assign a truck to this order",
      });
    }

    if (!["confirmed_by_shipper", "awaiting_shipment"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `A truck cannot be assigned while the order is "${order.status}". Confirm the order first.`,
      });
    }

    const Vehicle = require("../models/Vehicle");
    const vehicle = await Vehicle.findOne({ _id: vehicleId, agency: req.user._id });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Truck not found in your fleet",
      });
    }

    if (!vehicle.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This truck is not yet admin-verified and cannot be assigned",
      });
    }

    order.vehicle = {
      type: vehicle.type,
      capacity: vehicle.capacityWeight,
      registrationNumber: vehicle.registrationNumber,
    };

    if (vehicle.driver) {
      order.driver = vehicle.driver;
    }

    order.status = "awaiting_shipment";
    order.tracking.currentStatus = "Driver Assigned";
    order.tracking.timeline.push({
      status: "Driver Assigned",
      message: `Truck ${vehicle.registrationNumber} assigned`,
      createdAt: new Date(),
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("buyer", "name email phone")
      .populate("driver", "name phone")
      .populate("items.product");

    res.json({
      success: true,
      message: "Truck assigned",
      order: populatedOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/**
 * Download Order Invoice — streams the PDF generated at payment time.
 * Invoices live outside the publicly-served uploads/ directory (see
 * utils/invoiceService.js) specifically so this auth + ownership check
 * is the only way to reach one; they're not guessable/public files.
 * Reuses the same buyer/shipper/driver/admin check as getOrderById.
 */
exports.getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isBuyer = order.buyer && order.buyer.equals(req.user._id);
    const isShipper = order.shipper && order.shipper.equals(req.user._id);
    const isDriver = order.driver && order.driver.equals(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isShipper && !isDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order's invoice",
      });
    }

    // invoiceNumber is only ever set by utils/invoiceService.js (format
    // "CZ-<timestamp>") and is never user-supplied, but this endpoint
    // builds a filesystem path from it, so validate the shape defensively
    // rather than trusting it blindly.
    if (!order.payment.invoiceNumber || !/^[A-Za-z0-9_-]+$/.test(order.payment.invoiceNumber)) {
      return res.status(404).json({
        success: false,
        message: "No invoice has been generated for this order yet",
      });
    }

    const filePath = path.join(
      __dirname,
      "../../private/invoices",
      `${order.payment.invoiceNumber}.pdf`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Invoice file not found",
      });
    }

    res.download(filePath, `${order.payment.invoiceNumber}.pdf`);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get Order By ID (kept below the more specific routes above)
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("driver", "name phone")
      .populate("shipper", "name")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isBuyer = order.buyer && order.buyer._id?.equals(req.user._id);
    const isShipper = order.shipper && order.shipper._id?.equals(req.user._id);
    const isDriver = order.driver && order.driver._id?.equals(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isShipper && !isDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Order Tracking — status timeline plus, if a truck has been assigned,
 * that vehicle's live position (mirrors shipmentController.getShipmentTracking's
 * shape/auth pattern so the two map components can share logic later).
 */
exports.getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name")
      .populate("driver", "name phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isBuyer = order.buyer && order.buyer._id?.equals(req.user._id);
    const isShipper = order.shipper && order.shipper.equals(req.user._id);
    const isDriver = order.driver && order.driver._id?.equals(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isShipper && !isDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to track this order",
      });
    }

    // order.vehicle is a static snapshot copied in at assign-truck time
    // (registrationNumber/type/capacity) — it has no live position. Look
    // the real Vehicle doc up by registration number to get its current
    // currentLocation/locationUpdatedAt/isSharingLocation for the map.
    let vehicle = null;
    if (order.vehicle?.registrationNumber) {
      const Vehicle = require("../models/Vehicle");
      const liveVehicle = await Vehicle.findOne({
        registrationNumber: order.vehicle.registrationNumber,
      }).select("registrationNumber type currentLocation locationUpdatedAt isSharingLocation");

      vehicle = {
        registrationNumber: order.vehicle.registrationNumber,
        type: order.vehicle.type,
        currentLocation: liveVehicle?.currentLocation || null,
        locationUpdatedAt: liveVehicle?.locationUpdatedAt || null,
        isSharingLocation: liveVehicle?.isSharingLocation || false,
      };
    }

    const currentStatus = order.orderType === "product" ? order.status : order.tracking?.currentStatus;

    res.json({
      success: true,
      order,
      tracking: {
        status: currentStatus,
        driver: order.driver ? { name: order.driver.name, phone: order.driver.phone } : null,
        vehicle,
        timeline: order.tracking?.timeline || [],
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Cancel Order — works for both shipment and product orders.
 */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.buyer.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    if (order.orderType === "product") {
      if (["delivered", "cancelled"].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Order already ${order.status}`,
        });
      }
      order.status = "cancelled";
    } else {
      order.tracking.currentStatus = "Cancelled";
      order.tracking.timeline.push({
        status: "Cancelled",
        message: "Order cancelled by buyer",
        createdAt: new Date(),
      });
    }

    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Update Order Status (shipment orders — driver/admin/shipper actions)
 */
const PRODUCT_ORDER_STATUSES = [
  "placed",
  "confirmed_by_shipper",
  "awaiting_shipment",
  "shipment_requested",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const FREIGHT_ORDER_STATUSES = [
  "Draft",
  "Submitted",
  "Admin Review",
  "Approved",
  "Driver Assigned",
  "Driver Accepted",
  "Pickup Started",
  "Picked Up",
  "In Transit",
  "Reached Destination",
  "Delivered",
  "Completed",
  "Cancelled",
];

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isShipper = order.shipper && order.shipper.equals(req.user._id);
    const isDriver = order.driver && order.driver.equals(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isShipper && !isDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order's status",
      });
    }

    if (order.orderType === "product") {
      if (!PRODUCT_ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `"${status}" is not a valid status for this order type`,
        });
      }
      order.status = status;
      order.tracking.timeline.push({
        status,
        message: `Status changed to ${status.replace(/_/g, " ")}`,
        createdAt: new Date(),
        updatedBy: req.user._id,
      });
    } else {
      if (!FREIGHT_ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `"${status}" is not a valid status for this order type`,
        });
      }
      order.tracking.currentStatus = status;
      order.tracking.timeline.push({
        status,
        message: `Status changed to ${status}`,
        createdAt: new Date(),
        updatedBy: req.user._id,
      });
    }

    await order.save();

    const io = req.app.get("io");

    if (io) {
      io.to(order._id.toString()).emit("status-update", {
        bookingId: order._id,
        status,
      });
    }

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Assign Driver
 */
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.driver = driverId;

    order.tracking.currentStatus = "Driver Assigned";

    order.tracking.timeline.push({
      status: "Driver Assigned",
      message: "Driver assigned successfully",
      createdAt: new Date(),
    });

    await order.save();

    res.json({
      success: true,
      message: "Driver assigned",
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name")
      .populate("driver", "name phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isBuyer = order.buyer && order.buyer._id?.equals(req.user._id);
    const isShipper = order.shipper && order.shipper.equals(req.user._id);
    const isDriver = order.driver && order.driver._id?.equals(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isShipper && !isDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to track this order",
      });
    }

    // order.vehicle is a static snapshot copied in at assign-truck time
    // (registrationNumber/type/capacity) — it has no live position. Look
    // the real Vehicle doc up by registration number to get its current
    // currentLocation/locationUpdatedAt/isSharingLocation for the map.
    let vehicle = null;
    if (order.vehicle?.registrationNumber) {
      const Vehicle = require("../models/Vehicle");
      const liveVehicle = await Vehicle.findOne({
        registrationNumber: order.vehicle.registrationNumber,
      }).select("registrationNumber type currentLocation locationUpdatedAt isSharingLocation");

      vehicle = {
        // Needed so the frontend can join this vehicle's `vehicle:<id>`
        // Socket.IO room for live push updates — without it the map falls
        // back to polling only.
        id: liveVehicle?._id || null,
        registrationNumber: order.vehicle.registrationNumber,
        type: order.vehicle.type,
        currentLocation: liveVehicle?.currentLocation || null,
        locationUpdatedAt: liveVehicle?.locationUpdatedAt || null,
        isSharingLocation: liveVehicle?.isSharingLocation || false,
      };
    }

    const currentStatus = order.orderType === "product" ? order.status : order.tracking?.currentStatus;

    res.json({
      success: true,
      order,
      tracking: {
        status: currentStatus,
        driver: order.driver ? { name: order.driver.name, phone: order.driver.phone } : null,
        vehicle,
        timeline: order.tracking?.timeline || [],
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Generate Delivery OTP
 */
exports.generateOTP = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    order.deliveryOTP = {
      code: otp,
      verified: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };

    await order.save();

    res.json({
      success: true,
      otp,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};