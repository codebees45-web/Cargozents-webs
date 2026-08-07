import MarketingLayout from '../components/marketing/MarketingLayout';

const steps = [
  {
    title: '1. Post or browse',
    body: 'Shippers can post a shipment or browse live product demand, while drivers can mark the routes they are already taking.',
  },
  {
    title: '2. Match and confirm',
    body: 'The platform surfaces the best fit based on route overlap, timing, cargo type, and vehicle capacity.',
  },
  {
    title: '3. Move and track',
    body: 'Once confirmed, both sides follow the trip in real time and complete the handoff through the same flow.',
  },
];

const HowItWorksPage = () => {
  return (
    <MarketingLayout
      eyebrow="HOW IT WORKS"
      title="From empty leg to booked load in three steps."
      subtitle="The flow is built to feel simple for shippers, buyers, and drivers alike."
    >
      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.title} className="rounded-2xl border border-primary/10 bg-secondary/40 p-6">
            <h2 className="font-display text-xl font-semibold text-primary">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5B7A70]">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-accent/30 bg-accent/10 p-6">
        <p className="font-mono-ls text-[11px] tracking-[0.2em] text-primary">WHY IT MATTERS</p>
        <p className="mt-2 text-sm leading-relaxed text-[#5B7A70]">
          Each matched trip reduces wasted miles, improves margins, and helps the logistics network move more efficiently.
        </p>
      </div>
    </MarketingLayout>
  );
};

export default HowItWorksPage;
