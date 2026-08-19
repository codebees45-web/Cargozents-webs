const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    shipper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    unit: {
      // e.g. "per kg", "per box", "per piece"
      type: String,
      required: true,
      default: 'unit',
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    images: {
      type: [String], // Cloudinary URLs
      default: [],
    },

    // Weight/volume of a single unit — needed later when an Order is
    // converted into a Shipment, so the vehicle-matching engine knows
    // total load size (quantity * weightPerUnit).
    weightPerUnit: {
      type: Number, // in kg
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ shipper: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
