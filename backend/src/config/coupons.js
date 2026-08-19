// Static demo coupon codes for the Shop / Checkout (product-order) flow.
//
// This is intentionally simple (no DB-backed Coupon model, no expiry/usage
// tracking) — enough to let checkout demo a discount end-to-end. The backend
// is still the source of truth: the frontend never sends a discount amount,
// only a code, and the amount is always recomputed here.
//
// percentOff: whole-number percentage discount on the product subtotal.
// minSubtotal: subtotal (in rupees) required for the code to apply.
const COUPONS = {
  SAVE10: { percentOff: 10, minSubtotal: 0 },
  SAVE20: { percentOff: 20, minSubtotal: 1000 },
  WELCOME50: { percentOff: 50, minSubtotal: 0 },
};

/**
 * Looks up a coupon code and returns the discount to apply against a given
 * subtotal, or null if the code is invalid / doesn't meet its minimum.
 */
function resolveCoupon(code, subtotal) {
  if (!code) return null;
  const coupon = COUPONS[String(code).trim().toUpperCase()];
  if (!coupon) return null;
  if (subtotal < coupon.minSubtotal) return null;

  const discountAmount = Math.round((subtotal * coupon.percentOff) / 100);
  return {
    code: String(code).trim().toUpperCase(),
    percentOff: coupon.percentOff,
    discountAmount,
  };
}

module.exports = { COUPONS, resolveCoupon };