require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Shipment = require('../models/Shipment');
const workflowStressData = require('../data/workflowStressData');

const seedWorkflowStress = async () => {
  await connectDB();

  const emailList = workflowStressData.users.map((u) => u.email);
  await Promise.all([
    User.deleteMany({ email: { $in: emailList } }),
    Product.deleteMany({ shipper: { $exists: true } }),
    Order.deleteMany({ buyer: { $exists: true } }),
    Shipment.deleteMany({ shipper: { $exists: true } }),
  ]);

  const createdUsers = {};
  for (const userData of workflowStressData.users) {
    const createdUser = await User.create(userData);
    createdUsers[userData.key] = createdUser;
  }

  const createdProducts = [];
  for (const productData of workflowStressData.products) {
    const createdProduct = await Product.create({
      ...productData,
      shipper: createdUsers[productData.shipperKey]._id,
    });
    createdProducts.push(createdProduct);
  }

  for (const orderData of workflowStressData.orders) {
    const matchedProduct = createdProducts.find((product) => product.key === orderData.productKey);
    await Order.create({
      buyer: createdUsers[orderData.buyerKey]._id,
      shipper: createdUsers[orderData.shipperKey]._id,
      items: [{
        product: matchedProduct?._id || createdProducts[0]._id,
        quantity: orderData.quantity,
        priceAtPurchase: orderData.priceAtPurchase,
      }],
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

  for (const shipmentData of workflowStressData.shipments) {
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

  console.log('Workflow stress data created successfully.');
  console.log('Stress accounts created with password: Password123');
  await mongoose.connection.close();
  process.exit(0);
};

seedWorkflowStress().catch((err) => {
  console.error('Workflow stress seed failed:', err);
  process.exit(1);
});
