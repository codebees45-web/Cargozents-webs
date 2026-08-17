import { useTranslation } from 'react-i18next';

const RolesSection = () => {
  const { t } = useTranslation();
  
  const roles = [
    {
      code: t('landing.roles.buyer.code', 'BUYER'),
      desc: t('landing.roles.buyer.desc', 'Order directly from a shipper’s catalog and track delivery to your door.'),
    },
    {
      code: t('landing.roles.shipper.code', 'SHIPPER'),
      desc: t('landing.roles.shipper.desc', 'Sell products or post one-off shipments — request a truck whenever you need one.'),
    },
    {
      code: t('landing.roles.driver.code', 'DRIVER'),
      desc: t('landing.roles.driver.desc', 'Declare your route and capacity, accept matched loads, get paid per trip.'),
    },
    {
      code: t('landing.roles.admin.code', 'ADMIN'),
      desc: t('landing.roles.admin.desc', 'Verify drivers and vehicles, assign trucks to requests, and monitor the network.'),
    },
  ];
  
  return (
    <section className="border-b border-primary/10 px-6 py-24 md:px-16">
      <div className="mx-auto max-w-6xl">
        <span className="font-mono-ls text-xs tracking-[0.2em] text-primary/80">
          {t('landing.roles.eyebrow', 'ONE NETWORK, FOUR ROLES')}
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold text-primary md:text-4xl">
          {t('landing.roles.title', 'Built for everyone in the chain.')}
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
