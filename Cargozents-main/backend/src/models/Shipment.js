const mongoose = require('mongoose');

const geoPointSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },
  { _id: false }
);

const shipmentSchema = new mongoose.Schema(
  {
    shipper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Set only when this shipment originated from a Buyer order
    // (Swiggy-style flow). Null for raw/manual postings.
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    source: {
      type: String,
      enum: ['order', 'manual'],
      required: true,
    },

    goodsType: { type: String, required: true },
    weight: { type: Number, required: true }, // kg
    volume: { type: Number }, // cubic meters, optional

    vehicleRequired: {
      type: String,
      enum: ['mini_truck', 'tempo', 'container', 'trailer', 'open_body'],
      required: true,
    },

    pickup: { type: geoPointSchema, required: true },
    drop: { type: geoPointSchema, required: true },

    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String }, // e.g. "14:00"
    specialInstructions: { type: String, default: '' },
    insuranceOpted: { type: Boolean, default: false },

    estimatedPrice: { type: Number },
    finalPrice: { type: Number },

    // Delivery payment — kept separate from Order.productPaymentStatus
    deliveryPaymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    deliveryPaidBy: {
      type: String,
      enum: ['buyer', 'shipper'],
      default: 'shipper',
    },

    // Lifecycle: request -> admin assigns driver -> driver accepts ->
    // pickup -> delivery
    status: {
      type: String,
      enum: [
        'requested',       // shipper submitted, awaiting admin action
        'assigned',        // admin picked a driver, awaiting driver response
        'accepted',        // driver accepted
        'rejected',        // driver rejected, needs reassignment
        'picked_up',
        'in_transit',
        'delivered',
        'cancelled',
      ],
      default: 'requested',
    },

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // admin who made the assignment
      default: null,
    },
    assignedAt: { type: Date, default: null },

    // Flagged true when this shipment fills a truck's empty return leg —
    // core to the backhaul-matching feature.
    isBackhaulMatch: { type: Boolean, default: false },
    priorityScore: { type: Number, default: 0 },

    trackingHistory: [
      {
        status: String,
        location: {
          type: { type: String, enum: ['Point'] },
          coordinates: [Number],
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

shipmentSchema.index({ 'pickup.location': '2dsphere' });
shipmentSchema.index({ 'drop.location': '2dsphere' });
shipmentSchema.index({ status: 1, shipper: 1 });

module.exports = mongoose.model('Shipment', shipmentSchema);
