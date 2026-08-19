const mongoose = require("mongoose");

const trackingEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      default: "",
    },

    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    shipper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // "shipment" = freight booking (Book Shipment wizard). "product" = a
    // cart order placed against a shipper's product catalog (Shop/Checkout).
    // The two flows share this collection because a lot of downstream logic
    // (reviews, cancellation, status timeline) is identical, but only a
    // subset of the fields below is populated for either type.
    orderType: {
      type: String,
      enum: ["shipment", "product"],
      default: "shipment",
    },

    pickup: {
      address: {
        type: String,
      },

      latitude: Number,
      longitude: Number,

      contactName: String,
      contactPhone: String,
    },

    delivery: {
      address: {
        type: String,
      },

      latitude: Number,
      longitude: Number,

      contactName: String,
      contactPhone: String,
    },

    // --- Product-order (Shop/Checkout) fields ---
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          min: 1,
        },
        priceAtPurchase: Number,
      },
    ],

    // productTotal is the final payable amount (after any coupon discount) —
    // kept as-is so existing code that reads it as "amount charged" still
    // works. productSubtotal/discountAmount/couponCode exist purely for
    // itemised display (order confirmation, invoices, admin views).
    productSubtotal: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    couponCode: {
      type: String,
      default: null,
    },

    productTotal: {
      type: Number,
      default: 0,
    },

    deliveryAddress: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
      contactName: String,
      contactPhone: String,
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },

    productPaymentMethod: {
      type: String,
      enum: ["cod", "upi", "card", "netbanking"],
    },

    productPaymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    // Lifecycle for product orders (mirrors what the buyer dashboard UI
    // expects). Shipment orders continue to use tracking.currentStatus
    // below instead.
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed_by_shipper",
        "awaiting_shipment",
        "shipment_requested",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
    },

    hasReview: {
      type: Boolean,
      default: false,
    },

    goods: {
      name: {
        type: String,
      },

      category: String,

      quantity: Number,

      weight: Number,

      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },

      fragile: {
        type: Boolean,
        default: false,
      },

      hazardous: {
        type: Boolean,
        default: false,
      },

      refrigerated: {
        type: Boolean,
        default: false,
      },

      stackable: {
        type: Boolean,
        default: true,
      },

      notes: String,
    },

    vehicle: {
      type: {
        type: String,
      },

      capacity: Number,

      registrationNumber: String,
    },

    shipment: {
      deliveryType: {
        type: String,
        enum: [
          "Standard",
          "Express",
          "Same Day",
        ],
        default: "Standard",
      },

      pickupSchedule: Date,

      estimatedDistance: Number,

      estimatedDuration: Number,
    },

    pricing: {
      baseFare: {
        type: Number,
        default: 0,
      },

      distanceCharge: {
        type: Number,
        default: 0,
      },

      fuelCharge: {
        type: Number,
        default: 0,
      },

      tollCharge: {
        type: Number,
        default: 0,
      },

      insuranceCharge: {
        type: Number,
        default: 0,
      },

      gst: {
        type: Number,
        default: 0,
      },

      totalAmount: {
        type: Number,
        default: 0,
      },
    },

    payment:{

        status:String,

        razorpayOrderId:String,

        razorpayPaymentId:String,

        razorpaySignature:String,

        transactionId:String,

        invoiceNumber:String,

        invoiceUrl:String,

        paidAt:Date

        },

    tracking: {
      currentStatus: {
        type: String,
        enum: [
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
        ],
        default: "Draft",
      },

      timeline: [trackingEventSchema],
    },

    deliveryOTP: {
      code: String,

      verified: {
        type: Boolean,
        default: false,
      },

      expiresAt: Date,
    },
    deliveryVerification: {
        otp: {
            type: String,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        verifiedAt: Date,
    },

    documents: [documentSchema],

    rating: {
      stars: {
        type: Number,
        min: 1,
        max: 5,
      },

      review: String,
    },
  },
  {
    timestamps: true,
  }
);



module.exports = mongoose.model("Order", orderSchema);