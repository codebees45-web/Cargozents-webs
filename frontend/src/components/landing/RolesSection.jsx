const roles = [
  {
    code: 'BUYER',
    desc: 'Order directly from a shipper\u2019s catalog and track delivery to your door.',
  },
  {
    code: 'SHIPPER',
    desc: 'Sell products or post one-off shipments \u2014 request a truck whenever you need one.',
  },
  {
    code: 'DRIVER',
    desc: 'Declare your route and capacity, accept matched loads, get paid per trip.',
  },
  {
    code: 'ADMIN',
    desc: 'Verify drivers and vehicles, assign trucks to requests, and monitor the network.',
  },
];

const RolesSection = () => {
  return (
    <section className="border-b border-primary/10 px-6 py-24 md:px-16">
      <div className="mx-auto max-w-6xl">
        <span className="font-mono-ls text-xs tracking-[0.2em] text-primary/80">
          ONE NETWORK, FOUR ROLES
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold text-primary md:text-4xl">
          Built for everyone in the chain.
        </h2>

        <div className="mt-14 divide-y divide-white/5 border-y border-primary/10">
          {roles.map((role) => (
            <div
              key={role.code}
              className="grid grid-cols-1 gap-2 py-6 md:grid-cols-[160px_1fr] md:items-center md:gap-8"
            >
              <span className="font-mono-ls text-sm tracking-[0.1em] text-primary">
                {role.code}
              </span>
              <p className="text-sm leading-relaxed text-[#5B7A70] md:text-base">{role.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
