import MarketingLayout from '../components/marketing/MarketingLayout';

const About = () => {
  return (
    <MarketingLayout
      eyebrow="ABOUT CARGOZENTS"
      title="Built around one wasted trip."
      subtitle="Every logistics network loses money the same way: on the leg nobody planned for."
    >
      <div className="space-y-6 text-sm leading-relaxed text-[#5B7A70] md:text-base">
        <p>
          A truck delivers a load, then drives back empty. That return leg still burns diesel,
          still costs the driver time, and still wears down the vehicle — but it earns nothing.
          Multiply that across every truck on every route in India, and it adds up to one of the
          most expensive inefficiencies in freight.
        </p>
        <p>
          Cargozents exists to close that gap. We connect buyers who need goods delivered,
          shippers who need a truck, and drivers who are already on the road — so return legs
          stop being a cost and start being a second trip.
        </p>
        <p>
          We're building this as a real, working platform: shipment posting, driver matching,
          live tracking, and payments, all in one place — not a pitch deck.
        </p>
      </div>

      <div className="mt-14 grid gap-8 border-t border-primary/10 pt-10 sm:grid-cols-3">
        {[
          { label: 'WHO WE SERVE', body: 'Buyers, shippers, and drivers across Indian freight routes.' },
          { label: 'WHAT WE FIX', body: 'Empty return trips \u2014 the backhaul problem.' },
          { label: 'HOW', body: 'A matching engine, live tracking, and one shared network.' },
        ].map((item) => (
          <div key={item.label}>
            <p className="font-mono-ls text-[11px] tracking-wide text-primary">{item.label}</p>
            <p className="mt-2 text-sm text-[#5B7A70]">{item.body}</p>
          </div>
        ))}
      </div>
    </MarketingLayout>
  );
};

export default About;
