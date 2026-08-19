import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Truck } from 'lucide-react';

const Hero = () => {
  const containerRef = useRef(null);

  // Setup scroll-driven animation tied to the hero section's visibility in viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Map scroll progress to scale and opacity values (removed blur to keep buttons clickable)
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  return (
    <section 
      ref={containerRef} 
      className="relative overflow-hidden pt-32 pb-24 md:px-16 min-h-[90vh] flex items-center bg-white text-primary"
    >
      {/* SVG Clip Path Definition for the swooping curve */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <clipPath id="hero-curve" clipPathUnits="objectBoundingBox">
             {/* A smooth swoosh curve. Starts top-left(ish), curves down to bottom-left(ish) */}
            <path d="M 0.25 0 C 0.6 0.3, 0.05 0.7, 0.35 1 L 1 1 L 1 0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Right side curved background with Truck photo */}
      <div 
        className="absolute right-0 top-0 h-full w-[100%] md:w-[75%] lg:w-[65%] pointer-events-none"
        style={{ clipPath: 'url(#hero-curve)' }}
      >
        <div className="absolute inset-0 bg-[#0A261D]">
          <img 
            src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop"
            alt="Delivery truck"
            className="w-full h-full object-cover opacity-50 mix-blend-luminosity"
          />
          {/* Subtle green tint overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0A261D] to-[#00C853]/30 mix-blend-overlay" />
        </div>
      </div>

      {/* Subtle green glow on the left side (like the image) */}
      <div className="absolute left-0 top-0 w-1/2 h-full pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_30%,rgba(0,200,83,0.1)_0%,transparent_60%)]" />
      </div>

      <motion.div 
        className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-16 md:grid-cols-[1.1fr_1.9fr] px-6 w-full"
        style={{ scale, opacity, willChange: 'transform, opacity' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="font-mono-ls text-xs tracking-[0.2em] text-primary/80">
            BACKHAUL FREIGHT NETWORK
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-[#0A261D] md:text-5xl lg:text-[3.5rem]">
            Every <span className="text-[#00C853]">empty</span> truck<br />
            is a shipment<br />
            <span className="text-[#00C853]">waiting</span> to happen.
          </h1>
          <p className="mt-8 max-w-md text-sm font-medium leading-relaxed text-[#5B7A70] md:text-base">
            Cargozents connects buyers, shippers, and drivers on one network —
            so a truck heading back empty picks up someone else's load instead.
            Less wasted diesel, more driver income, faster delivery for everyone.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="/signup?role=shipper"
              className="group flex items-center gap-2 rounded-lg bg-[#00C853] px-6 py-3 font-semibold text-white shadow-lg shadow-[#00C853]/30 transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,200,83,0.5)]"
            >
              Post a shipment
              <Truck className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            <a
              href="/signup?role=driver"
              className="rounded-lg border-2 border-[#00C853] bg-transparent px-6 py-3 font-semibold text-[#00C853] backdrop-blur-sm transition-all duration-200 hover:bg-[#00C853] hover:text-white"
            >
              Drive with Cargozents
            </a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
