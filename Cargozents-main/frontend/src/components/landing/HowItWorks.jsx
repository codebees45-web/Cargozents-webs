const steps = [
  {
    num: '01',
    title: 'A load enters the network',
    body: 'A buyer orders from a shipper\u2019s catalog, or a shipper posts a shipment directly \u2014 goods, weight, pickup, and drop.',
  },
  {
    num: '02',
    title: 'Cargozents matches the truck',
    body: 'The dispatch engine checks nearby drivers already heading that way \u2014 especially ones about to run their return leg empty.',
  },
  {
    num: '03',
    title: 'The driver delivers and gets paid',
    body: 'Pickup, live tracking, drop-off, and payout \u2014 the driver earns on a leg that used to cost them money.',
  },
];

const HowItWorks = () => {
  return (
    <section className="border-b border-primary/10 px-6 py-24 md:px-16">
      <div className="mx-auto max-w-6xl">
        <span className="font-mono-ls text-xs tracking-[0.2em] text-primary/80">
          HOW IT WORKS
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold text-primary md:text-4xl">
          Three steps, one network.
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              <span className="font-mono-ls text-sm text-primary/60">{step.num}</span>
              <h3 className="mt-3 font-display text-lg font-semibold text-primary">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5B7A70]">{step.body}</p>
              {i < steps.length - 1 && (
                <div className="mt-8 hidden h-px w-full bg-gradient-to-r from-primary/15 to-transparent md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
