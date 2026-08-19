import { motion } from 'framer-motion';
import { ShoppingBag, Package, Truck, ShieldCheck } from 'lucide-react';

const roles = [
  {
    code: 'BUYER',
    desc: 'Order directly from a shipper\u2019s catalog and track delivery to your door.',
    icon: ShoppingBag,
    color: '#0ea5e9' // sky-500
  },
  {
    code: 'SHIPPER',
    desc: 'Sell products or post one-off shipments \u2014 request a truck whenever you need one.',
    icon: Package,
    color: '#FF6B6B' // coral
  },
  {
    code: 'DRIVER',
    desc: 'Declare your route and capacity, accept matched loads, get paid per trip.',
    icon: Truck,
    color: '#00C853' // success
  },
  {
    code: 'ADMIN',
    desc: 'Verify drivers and vehicles, assign trucks to requests, and monitor the network.',
    icon: ShieldCheck,
    color: '#F59E0B' // warning
  },
];

const RolesSection = () => {
  return (
    <section className="border-b border-primary/10 px-6 py-28 md:px-16 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="font-mono-ls text-xs tracking-[0.2em] text-primary/80">
            ONE NETWORK, FOUR ROLES
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-primary md:text-4xl">
            Built for everyone in the chain.
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, i) => (
            <motion.div
              key={role.code}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15, type: 'spring', stiffness: 80 }}
              className="group relative flex flex-col items-center text-center rounded-2xl bg-secondary/50 p-8 border border-white/5 shadow-sm transition-all hover:-translate-y-2 hover:shadow-lg backdrop-blur-sm"
              style={{ borderTop: `4px solid ${role.color}` }}
            >
              <div 
                className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-md transition-transform duration-300 group-hover:scale-110"
                style={{ color: role.color }}
              >
                <role.icon className="h-7 w-7" />
              </div>
              <span className="font-mono-ls text-sm tracking-[0.1em] text-primary font-bold">
                {role.code}
              </span>
              <p className="mt-4 text-sm leading-relaxed text-[#5B7A70] dark:text-muted">
                {role.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
