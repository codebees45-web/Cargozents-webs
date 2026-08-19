import { motion } from 'framer-motion';
import { Truck, PackageSearch } from 'lucide-react';

const ProblemSection = () => {
  return (
    <section className="border-b border-primary/10 px-6 py-24 md:px-16 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="font-mono-ls text-xs tracking-[0.2em] text-primary/80">
            THE BACKHAUL PROBLEM
          </span>
          <h2 className="mt-4 max-w-xl font-display text-3xl font-bold text-primary md:text-4xl">
            Half the trip is usually wasted.
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {/* WITHOUT CARGOZENTS CARD */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-2xl bg-secondary p-8 md:p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-l-[6px] border-[#FF6B6B]"
          >
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6B6B]/10 text-[#FF6B6B]">
              <Truck className="h-6 w-6" />
            </div>
            <span className="block font-mono-ls text-[11px] tracking-[0.15em] text-[#FF6B6B]">
              WITHOUT CARGOZENTS
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold text-primary">
              The return trip runs empty.
            </h3>
            <ul className="mt-5 space-y-3">
              {[
                'Truck delivers, then drives back with nothing on board.',
                'Diesel, tolls, and driver time are spent for zero revenue.',
                'The next shipment waits for a truck that was already on the road.',
              ].map((line, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i * 0.15), type: 'spring', stiffness: 100 }}
                  className="flex gap-3 text-sm leading-relaxed text-[#5B7A70] dark:text-muted"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6B6B]" />
                  {line}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* WITH CARGOZENTS CARD */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-2xl bg-secondary p-8 md:p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,200,83,0.15)] border-l-[6px] border-success"
          >
            {/* Subtle glow pulse in background */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-success/20 blur-[80px]"
            />
            
            <div className="relative z-10 mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <PackageSearch className="h-6 w-6" />
            </div>
            <span className="relative z-10 block font-mono-ls text-[11px] tracking-[0.15em] text-success">
              WITH CARGOZENTS
            </span>
            <h3 className="relative z-10 mt-3 font-display text-xl font-semibold text-primary">
              The return trip earns.
            </h3>
            <ul className="relative z-10 mt-5 space-y-3">
              {[
                'A nearby shipment is matched to the truck\u2019s return route.',
                'The driver earns on a leg that used to be a pure cost.',
                'The shipper gets a truck that was already headed their way.',
              ].map((line, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + (i * 0.15), type: 'spring', stiffness: 100 }}
                  className="flex gap-3 text-sm leading-relaxed text-[#5B7A70] dark:text-muted"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  {line}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
