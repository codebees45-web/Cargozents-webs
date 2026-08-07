import MarketingLayout from '../components/marketing/MarketingLayout';

const sections = [
  {
    title: 'What we collect',
    body: 'Account details (name, email, phone), location data for live tracking and driver matching, and documents submitted for driver/vehicle verification.',
  },
  {
    title: 'How we use it',
    body: 'To match shipments with available drivers, calculate delivery pricing, show live tracking, and verify driver and vehicle documents.',
  },
  {
    title: 'Location data',
    body: 'Driver location is used to find nearby shipments and provide live tracking to buyers and shippers during an active delivery. It is not shared outside an active shipment.',
  },
  {
    title: 'Data sharing',
    body: 'We share only what\u2019s needed to complete a shipment \u2014 for example, a shipper sees the assigned driver\u2019s name and vehicle, not their full document history.',
  },
  {
    title: 'Your controls',
    body: 'You can update or delete your account information from your profile settings at any time.',
  },
];

const Privacy = () => {
  return (
    <MarketingLayout eyebrow="LEGAL" title="Privacy Policy" subtitle="Last updated July 2026.">
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

export default Privacy;
