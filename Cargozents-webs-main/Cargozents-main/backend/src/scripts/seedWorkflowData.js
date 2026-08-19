require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Shipment = require('../models/Shipment');
const Complaint = require('../models/Complaint');
const Review = require('../models/Review');
const workflowSeedData = require('../data/workflowSeedData');

const seedWorkflowData = async () => {
  await connectDB();

  const emailList = workflowSeedData.users.map((u) => u.email);
  await Promise.all([
    User.deleteMany({ email: { $in: emailList } }),
    Vehicle.deleteMany({ registrationNumber: { $in: workflowSeedData.vehicles.map((v) => v.registrationNumber) } }),
    Product.deleteMany({ shipper: { $exists: true } }),
    Order.deleteMany({ buyer: { $exists: true } }),
    Shipment.deleteMany({ shipper: { $exists: true } }),
    Complaint.deleteMany({ user: { $exists: true } }),
    Review.deleteMany({ reviewer: { $exists: true } }),
  ]);

  const createdUsers = {};
  for (const userData of workflowSeedData.users) {
    const createdUser = await User.create(userData);
    createdUsers[userData.key] = createdUser;
  }

  const createdVehicles = [];
  for (const vehicleData of workflowSeedData.vehicles) {
    const vehicle = await Vehicle.create({
      ...vehicleData,
      driver: createdUsers[vehicleData.driverKey]._id,
      agency: createdUsers[vehicleData.agencyKey]._id,
      currentLocation: { type: 'Point', coordinates: vehicleData.currentLocation },
      homeBaseLocation: { type: 'Point', coordinates: vehicleData.homeBaseLocation },
    });
    createdVehicles.push(vehicle);
  }

  const createdProducts = [];
  for (const productData of workflowSeedData.products) {
    const product = await Product.create({
      ...productData,
      shipper: createdUsers[productData.shipperKey]._id,
    });
    createdProducts.push(product);
  }

  const createdOrders = [];
  const productLookup = Object.fromEntries(createdProducts.map((product) => [product.name, product._id]));
  for (const orderData of workflowSeedData.orders) {
    const matchedProduct = createdProducts.find((product) => product.key === orderData.productKey);
    const order = await Order.create({
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
    createdOrders.push(order);
  }

  const createdShipments = [];
  for (const shipmentData of workflowSeedData.shipments) {
    const shipment = await Shipment.create({
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
      scheduledTime: '09:00',
      estimatedPrice: shipmentData.estimatedPrice,
      finalPrice: shipmentData.finalPrice,
      status: shipmentData.status,
      isBackhaulMatch: shipmentData.isBackhaulMatch,
    });
    createdShipments.push(shipment);
  }

  for (const complaintData of workflowSeedData.complaints) {
    const user = createdUsers[complaintData.userKey];
    await Complaint.create({
      user: user._id,
      subject: complaintData.subject,
      description: complaintData.description,
      status: complaintData.status,
    });
  }

  for (const reviewData of workflowSeedData.reviews) {
    const reviewer = createdUsers[reviewData.reviewerKey];
    const reviewee = createdUsers[reviewData.revieweeKey];
    await Review.create({
      reviewer: reviewer._id,
      reviewee: reviewee._id,
      revieweeRole: reviewData.revieweeRole,
      rating: reviewData.rating,
      comment: reviewData.comment,
      shipment: createdShipments[0]?._id || null,
    });
  }

  console.log('Workflow seed data created successfully.');
  console.log('Accounts created with password: Password123');
  console.log('Sample emails:');
  workflowSeedData.users.forEach((user) => console.log(`- ${user.email}`));
  await mongoose.connection.close();
  process.exit(0);
};

seedWorkflowData().catch((err) => {
  console.error('Workflow seed failed:', err);
  process.exit(1);
});
