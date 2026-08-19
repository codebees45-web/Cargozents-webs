import MarketingLayout from '../components/marketing/MarketingLayout';

const sections = [
  {
    title: 'Using LoadShare',
    body: 'You must provide accurate account information and keep your login credentials secure. Buyers, shippers, and drivers each agree to the responsibilities specific to their role, as described in the platform.',
  },
  {
    title: 'Shipments and orders',
    body: 'Shippers are responsible for the accuracy of product listings and shipment details. Drivers are responsible for delivering loads as described, within the agreed timeframe.',
  },
  {
    title: 'Payments',
    body: 'Product payments go directly from buyer to shipper. Delivery payments are processed through LoadShare and are separate from product cost, as described on the Pricing page.',
  },
  {
    title: 'Verification',
    body: 'Drivers and vehicles must complete document verification before accepting loads. LoadShare reserves the right to suspend accounts that submit false documentation.',
  },
  {
    title: 'Liability',
    body: 'LoadShare facilitates connections between buyers, shippers, and drivers. Insurance for goods in transit is optional and selected at the time of shipment posting.',
  },
];

const Terms = () => {
  return (
    <MarketingLayout eyebrow="LEGAL" title="Terms of Service" subtitle="Last updated July 2026.">
      <div className="space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-lg font-semibold text-primary">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5B7A70]">{s.body}</p>
          </div>
        ))}
      </div>
    </MarketingLayout>
  );
};

export default Terms;
