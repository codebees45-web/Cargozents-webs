import { motion } from 'framer-motion';
import { PackageOpen, Map, IndianRupee } from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'A load enters the network',
    body: 'A buyer orders from a shipper\u2019s catalog, or a shipper posts a shipment directly \u2014 goods, weight, pickup, and drop.',
    icon: PackageOpen,
    color: '#FF6B6B',
    bgColor: 'bg-[#FF6B6B]/10'
  },
  {
    num: '02',
    title: 'Cargozents matches the truck',
    body: 'The dispatch engine checks nearby drivers already heading that way \u2014 especially ones about to run their return leg empty.',
    icon: Map,
    color: '#00C853',
    bgColor: 'bg-success/10'
  },
  {
    num: '03',
    title: 'The driver delivers and gets paid',
    body: 'Pickup, live tracking, drop-off, and payout \u2014 the driver earns on a leg that used to cost them money.',
    icon: IndianRupee,
    color: '#F59E0B',
    bgColor: 'bg-warning/10'
  },
];

const HowItWorks = () => {
  return (
    <section className="border-b border-primary/10 px-6 py-28 md:px-16 overflow-hidden relative">
      <div className="mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center md:text-left"
        >
          <span className="font-mono-ls text-xs tracking-[0.2em] text-primary/80">
            HOW IT WORKS
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-primary md:text-4xl">
            Three steps, one network.
          </h2>
        </motion.div>

        <div className="mt-24 relative grid gap-16 md:grid-cols-3 md:gap-8">
          
          {/* Animated Connecting SVG Line (Desktop Only) */}
          <div className="absolute top-[40px] left-[16%] right-[16%] hidden h-[4px] md:block z-0">
            <svg width="100%" height="10" preserveAspectRatio="none" className="absolute top-0 left-0">
               {/* Base faint dashed line */}
               <line
                 x1="0"
                 y1="2"
                 x2="100%"
                 y2="2"
                 stroke="#DCE7E1"
                 strokeWidth="2"
                 strokeDasharray="8 8"
               />
               {/* Animated green dashed line that draws on top */}
               <motion.line
                 x1="0"
                 y1="2"
                 x2="100%"
                 y2="2"
                 stroke="#00C853"
                 strokeWidth="3"
                 strokeDasharray="8 8"
                 initial={{ strokeDashoffset: 1000 }}
                 whileInView={{ strokeDashoffset: 0 }}
                 viewport={{ once: true, margin: "-100px" }}
                 transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                 className="drop-shadow-[0_0_8px_rgba(0,200,83,0.5)]"
               />
            </svg>
          </div>

          {steps.map((step, i) => (
            <motion.div 
              key={step.num} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 + (i * 0.2), ease: "easeOut" }}
              className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="relative mb-8">
                {/* Large Background Number */}
                <div className="absolute -left-6 -top-10 font-display text-[90px] font-black leading-none text-primary/5 select-none z-0">
                  {step.num}
                </div>
                {/* Circular Badge */}
                <div className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full ${step.bgColor} shadow-sm border border-white/50 backdrop-blur-sm transition-transform hover:scale-110 duration-300`}>
                  <step.icon className="h-8 w-8" style={{ color: step.color }} />
                </div>
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold text-primary">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#5B7A70] max-w-xs">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
