// Static plan catalogue. Prices are in INR (whole rupees); the controller
// converts to paise (x100) when creating Razorpay orders, since Razorpay
// always works in the smallest currency unit.
const PLANS = {
  free: {
    key: 'free',
    name: 'Free',
    price: 0,
    durationDays: null, // never expires
    features: [
      'List up to 5 products',
      'Post up to 3 shipments / month',
      'Standard support',
    ],
  },
  basic: {
    key: 'basic',
    name: 'Basic',
    price: 499,
    durationDays: 30,
    features: [
      'List up to 50 products',
      'Unlimited shipments',
      'Priority backhaul matching',
      'Email + WhatsApp support',
    ],
  },
  premium: {
    key: 'premium',
    name: 'Premium',
    price: 1499,
    durationDays: 30,
    features: [
      'Unlimited products',
      'Unlimited shipments',
      'Top priority backhaul matching',
      'Dedicated support line',
      'Downloadable analytics reports',
    ],
  },
};

module.exports = PLANS;