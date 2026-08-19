require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Shipment = require('../models/Shipment');
const Complaint = require('../models/Complaint');
const workflowEdgeCaseData = require('../data/workflowEdgeCaseData');

const seedWorkflowEdgeCases = async () => {
  await connectDB();

  const emailList = workflowEdgeCaseData.users.map((u) => u.email);
  await Promise.all([
    User.deleteMany({ email: { $in: emailList } }),
    Product.deleteMany({ shipper: { $exists: true } }),
    Order.deleteMany({ buyer: { $exists: true } }),
    Shipment.deleteMany({ shipper: { $exists: true } }),
    Complaint.deleteMany({ user: { $exists: true } }),
  ]);

  const createdUsers = {};
  for (const userData of workflowEdgeCaseData.users) {
    const createdUser = await User.create(userData);
    createdUsers[userData.key] = createdUser;
  }

  const createdProducts = [];
  for (const productData of workflowEdgeCaseData.products) {
    const createdProduct = await Product.create({
      ...productData,
      shipper: createdUsers[productData.shipperKey]._id,
    });
    createdProducts.push(createdProduct);
  }

  for (const orderData of workflowEdgeCaseData.orders) {
    const matchedProduct = createdProducts.find((product) => product.key === orderData.productKey);
    await Order.create({
      buyer: createdUsers[orderData.buyerKey]._id,
      shipper: createdUsers[orderData.shipperKey]._id,
      items: [
        {
          product: matchedProduct?._id || createdProducts[0]._id,
          quantity: orderData.quantity,
          priceAtPurchase: orderData.priceAtPurchase,
        },
      ],
      productTotal: orderData.productTotal,
      deliveryAddress: {
        line1: orderData.deliveryAddress.line1,
        city: orderData.deliveryAddress.city,
        state: orderData.deliveryAddress.state,
        pincode: orderData.deliveryAddress.pincode,
        location: { type: 'Point', coordinates: [0, 0] },
      },
      status: orderData.status,
    });
  }

  for (const shipmentData of workflowEdgeCaseData.shipments) {
    await Shipment.create({
      shipper: createdUsers[shipmentData.shipperKey]._id,
      source: shipmentData.source,
      goodsType: shipmentData.goodsType,
      weight: shipmentData.weight,
      volume: shipmentData.volume,
      vehicleRequired: shipmentData.vehicleRequired,
      pickup: {
        address: shipmentData.pickup.address,
        city: shipmentData.pickup.city,
        state: shipmentData.pickup.state,
        pincode: shipmentData.pickup.pincode,
        location: { type: 'Point', coordinates: shipmentData.pickup.coordinates },
      },
      drop: {
        address: shipmentData.drop.address,
        city: shipmentData.drop.city,
        state: shipmentData.drop.state,
        pincode: shipmentData.drop.pincode,
        location: { type: 'Point', coordinates: shipmentData.drop.coordinates },
      },
      scheduledDate: new Date(),
      scheduledTime: '10:00',
      estimatedPrice: shipmentData.estimatedPrice,
      finalPrice: shipmentData.finalPrice,
      status: shipmentData.status,
      isBackhaulMatch: shipmentData.isBackhaulMatch,
    });
  }

  for (const complaintData of workflowEdgeCaseData.complaints) {
    await Complaint.create({
      user: createdUsers[complaintData.userKey]._id,
      subject: complaintData.subject,
      description: complaintData.description,
      status: complaintData.status,
    });
  }

  console.log('Workflow edge-case data created successfully.');
  console.log('Password for all accounts: Password123');
  await mongoose.connection.close();
  process.exit(0);
};

seedWorkflowEdgeCases().catch((err) => {
  console.error('Workflow edge-case seed failed:', err);
  process.exit(1);
});
