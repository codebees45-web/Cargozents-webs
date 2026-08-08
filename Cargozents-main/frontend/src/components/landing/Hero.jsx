import { motion } from 'framer-motion';
import RouteDiagram from './RouteDiagram';

const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-primary/10 px-6 pt-32 pb-24 md:px-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-24 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="font-mono-ls text-xs tracking-[0.2em] text-primary/80">
            BACKHAUL FREIGHT NETWORK
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-primary md:text-5xl">
            Every empty truck<br />is a shipment waiting to happen.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[#5B7A70]">
            Cargozents connects buyers, shippers, and drivers on one network —
            so a truck heading back empty picks up someone else's load instead.
            Less wasted diesel, more driver income, faster delivery for everyone.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="/signup?role=shipper"
              className="rounded-lg bg-accent px-6 py-3 font-semibold text-primary transition hover:shadow-glow"
            >
              Post a shipment
            </a>
            <a
              href="/signup?role=driver"
              className="rounded-lg border border-primary/20 px-6 py-3 font-semibold text-primary transition hover:border-primary/50"
            >
              Drive with Cargozents
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-primary/10 bg-secondary/40 p-8"
        >
          <RouteDiagram />
          <p className="font-mono-ls text-[11px] text-[#5B7A70]">
            RETURN LEG STATUS — <span className="text-primary">MATCHING IN PROGRESS</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
