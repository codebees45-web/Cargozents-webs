import MarketingLayout from '../components/marketing/MarketingLayout';

const industries = [
  {
    name: 'Agriculture',
    body: 'Move produce, seeds, fodder, and farm inputs quickly across rural and peri-urban routes.',
  },
  {
    name: 'Retail & wholesale',
    body: 'Support shopkeepers and distributors with reliable backhaul capacity for replenishment trips.',
  },
  {
    name: 'Construction',
    body: 'Move sand, steel, cement, and equipment between sites and depots without deadhead miles.',
  },
  {
    name: 'Cold chain',
    body: 'Serve temperature-sensitive loads with verified vehicles and route-aware scheduling.',
  },
];

const Industries = () => {
  return (
    <MarketingLayout
      eyebrow="INDUSTRIES"
      title="Built for the real freight economy."
      subtitle="The same marketplace can support agriculture, retail, construction, and cold-chain logistics."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {industries.map((item) => (
          <div key={item.name} className="rounded-2xl border border-primary/10 bg-secondary/40 p-6">
            <h2 className="font-display text-lg font-semibold text-primary">{item.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5B7A70]">{item.body}</p>
          </div>
        ))}
      </div>
    </MarketingLayout>
  );
};

export default Industries;
