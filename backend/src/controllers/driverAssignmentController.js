const Driver = require("../models/Driver");
const Order = require("../models/Order");

const {
  recommendDriver,
} = require("../services/driverAssignmentService");

exports.assignDriver = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    const drivers = await Driver.find({
      available: true,
    });

    const bestDriver =
      recommendDriver(drivers, order);

    order.driver = bestDriver._id;

    order.tracking.currentStatus =
      "Driver Assigned";

    await order.save();

    res.json({
      success: true,
      driver: bestDriver,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};