const { z } = require("zod");

const orderSchema = z.object({
  pickup: z.object({
    address: z.string().min(5, "Pickup address is required"),
  }),

  delivery: z.object({
    address: z.string().min(5, "Delivery address is required"),
    contactName: z.string().min(2, "Receiver name is required"),
    contactPhone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  }),

  goods: z.object({
    name: z.string().min(2),
    category: z.string(),
    quantity: z.number().positive(),
    weight: z.number().positive(),

    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    }),

    fragile: z.boolean(),
    hazardous: z.boolean(),
    refrigerated: z.boolean(),
    stackable: z.boolean(),

    notes: z.string().optional(),
  }),

  shipment: z.object({
    deliveryType: z.enum([
      "Standard",
      "Express",
      "Same Day",
    ]),
    pickupSchedule: z.string().optional(),
  }),

  vehicle: z.any(),

  pricing: z.object({
    totalAmount: z.number().positive(),
  }),

  documents: z.array(z.any()).optional(),
});

module.exports = (req, res, next) => {
  try {
    orderSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Validation Failed",
      errors: err.errors,
    });
  }
};