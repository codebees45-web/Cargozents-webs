import MarketingLayout from '../components/marketing/MarketingLayout';

const plans = [
  {
    name: 'Buyer',
    price: 'Free',
    detail: 'to order',
    features: [
      'Browse shipper catalogs',
      'Track your delivery live',
      'Rate drivers after delivery',
      'No listing or platform fee',
    ],
  },
  {
    name: 'Shipper',
    price: '2.5%',
    detail: 'per completed shipment',
    features: [
      'List a product catalog',
      'Post raw shipments anytime',
      'Backhaul-matched trucks, when available',
      'Downloadable invoices',
    ],
    highlight: true,
  },
  {
    name: 'Driver',
    price: '0%',
    detail: 'commission on backhaul loads',
    features: [
      'Standard commission on outbound loads',
      'No fee on matched return-leg loads',
      'Weekly payouts to your wallet',
      'Document verification support',
    ],
  },
];

const Pricing = () => {
  return (
    <MarketingLayout
      eyebrow="PRICING"
      title="Simple, per-trip pricing."
      subtitle="No subscriptions. You pay Cargozents only when a shipment actually moves."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-7 ${
              plan.highlight ? 'border-primary bg-secondary' : 'border-primary/10'
            }`}
          >
            <p className="font-mono-ls text-[11px] tracking-wide text-primary">
              {plan.name.toUpperCase()}
            </p>
            <p className="mt-3 font-display text-3xl font-bold text-primary">{plan.price}</p>
            <p className="text-xs text-[#5B7A70]">{plan.detail}</p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-[#5B7A70]">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs text-[#5B7A70]">
        Delivery pricing itself (distance, weight, vehicle type, tolls, waiting charges) is
        calculated per shipment and shown before you confirm — see the shipment posting flow
        for a live estimate.
      </p>
    </MarketingLayout>
  );
};

export default Pricing;
