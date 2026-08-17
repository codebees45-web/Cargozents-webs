const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");


const { generateInvoice } = require("../utils/invoiceService");


exports.createPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ownership check: only the buyer who placed this order can start a
    // payment for it. Without this, any authenticated user could pass an
    // arbitrary orderId and generate a Razorpay order tied to someone
    // else's order.
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to pay for this order",
      });
    }

    if (order.payment.status === "Paid") {
      return res.status(400).json({
        success: false,
        message: "This order has already been paid for",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: order.pricing.totalAmount * 100,
      currency: "INR",
      receipt: order.orderId,
    });

    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification fields",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Timing-safe comparison so the check can't be used as a timing
    // oracle. Buffers must be equal length or timingSafeEqual throws,
    // so guard that first (mismatched length just means "not equal").
    const expectedBuf = Buffer.from(expectedSignature, "hex");
    const providedBuf = Buffer.from(String(razorpay_signature), "hex");
    const signaturesMatch =
      expectedBuf.length === providedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, providedBuf);

    if (!signaturesMatch) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ownership check: the order being marked paid must belong to the
    // caller.
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify payment for this order",
      });
    }

    // Critical: tie the verified signature back to the specific Razorpay
    // order we created for THIS order. Without this check, a valid
    // signature obtained from paying for order A could be replayed with
    // a different `orderId` in the request body to mark order B as paid
    // without ever paying its amount.
    if (order.payment.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment does not match this order",
      });
    }

    // Idempotency: if this order was already marked paid (e.g. a retried
    // request, or the client double-submitting), don't regenerate a
    // second invoice or re-run side effects.
    if (order.payment.status === "Paid") {
      return res.json({
        success: true,
        message: "Payment already verified",
      });
    }

    const invoice = await generateInvoice(order);

    order.payment.status = "Paid";
    order.payment.invoiceNumber = invoice.invoiceNo;
    order.payment.invoiceUrl = `/api/orders/${order._id}/invoice`;
    order.payment.paidAt = new Date();
    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;

    order.tracking.currentStatus = "Completed";

    await order.save();

    res.json({
      success: true,
      message: "Payment Successful",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};