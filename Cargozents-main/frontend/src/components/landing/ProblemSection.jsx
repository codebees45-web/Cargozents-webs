const panels = [
  {
    label: 'WITHOUT CARGOZENTS',
    accent: '#EF4444',
    title: 'The return trip runs empty.',
    lines: [
      'Truck delivers, then drives back with nothing on board.',
      'Diesel, tolls, and driver time are spent for zero revenue.',
      'The next shipment waits for a truck that was already on the road.',
    ],
  },
  {
    label: 'WITH CARGOZENTS',
    accent: '#10B981',
    title: 'The return trip earns.',
    lines: [
      'A nearby shipment is matched to the truck\u2019s return route.',
      'The driver earns on a leg that used to be a pure cost.',
      'The shipper gets a truck that was already headed their way.',
    ],
  },
];

const ProblemSection = () => {
  return (
    <section className="border-b border-primary/10 px-6 py-24 md:px-16">
      <div className="mx-auto max-w-6xl">
        <span className="font-mono-ls text-xs tracking-[0.2em] text-primary/80">
          THE BACKHAUL PROBLEM
        </span>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-bold text-primary md:text-4xl">
          Half the trip is usually wasted.
        </h2>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-primary/10 md:grid-cols-2">
          {panels.map((panel) => (
            <div key={panel.label} className="bg-secondary/30 p-8 md:p-10">
              <span
                className="font-mono-ls text-[11px] tracking-[0.15em]"
                style={{ color: panel.accent }}
              >
                {panel.label}
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold text-primary">
                {panel.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {panel.lines.map((line) => (
                  <li key={line} className="flex gap-3 text-sm leading-relaxed text-[#5B7A70]">
                    <span
                      className="mt-2 h-1 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: panel.accent }}
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
