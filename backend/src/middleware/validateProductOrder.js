const { z } = require("zod");

const productOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string().min(1, "Product id is required"),
        quantity: z.number().positive(),
      })
    )
    .min(1, "Your cart is empty"),

  deliveryAddress: z.object({
    line1: z.string().min(3, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().min(4, "Pincode is required"),
    location: z
      .object({
        type: z.literal("Point").optional(),
        coordinates: z.array(z.number()).length(2).optional(),
      })
      .optional(),
  }),

  productPaymentMethod: z.enum(["cod", "upi", "card", "netbanking"]),
});

module.exports = (req, res, next) => {
  try {
    productOrderSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Validation Failed",
      errors: err.errors,
    });
  }
};
