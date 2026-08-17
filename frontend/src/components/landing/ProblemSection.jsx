import { useTranslation } from 'react-i18next';

const ProblemSection = () => {
  const { t } = useTranslation();
  
  const panels = [
    {
      label: t('landing.problem.without.label', 'WITHOUT CARGOZENTS'),
      accent: '#EF4444',
      title: t('landing.problem.without.title', 'The return trip runs empty.'),
      lines: [
        t('landing.problem.without.line1', 'Truck delivers, then drives back with nothing on board.'),
        t('landing.problem.without.line2', 'Diesel, tolls, and driver time are spent for zero revenue.'),
        t('landing.problem.without.line3', 'The next shipment waits for a truck that was already on the road.'),
      ],
    },
    {
      label: t('landing.problem.with.label', 'WITH CARGOZENTS'),
      accent: '#10B981',
      title: t('landing.problem.with.title', 'The return trip earns.'),
      lines: [
        t('landing.problem.with.line1', 'A nearby shipment is matched to the truck’s return route.'),
        t('landing.problem.with.line2', 'The driver earns on a leg that used to be a pure cost.'),
        t('landing.problem.with.line3', 'The shipper gets a truck that was already headed their way.'),
      ],
    },
  ];

  return (
    <section className="border-b border-primary/10 px-6 py-24 md:px-16">
      <div className="mx-auto max-w-6xl">
        <span className="font-mono-ls text-xs tracking-[0.2em] text-primary/80">
          {t('landing.problem.eyebrow', 'THE BACKHAUL PROBLEM')}
        </span>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-bold text-primary md:text-4xl">
          {t('landing.problem.title', 'Half the trip is usually wasted.')}
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
