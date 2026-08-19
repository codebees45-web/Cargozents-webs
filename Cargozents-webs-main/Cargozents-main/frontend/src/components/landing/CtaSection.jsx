import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const CtaSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Subtle parallax for background circles
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const headline = "Stop paying for empty kilometers.";
  const words = headline.split(" ");

  return (
    <section ref={containerRef} className="relative overflow-hidden px-6 py-32 md:px-16 bg-[#0A110E] text-white">
      {/* Floating Background Shapes */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute -left-[20%] top-0 h-[500px] w-[500px] rounded-full bg-[#00C853]/10 blur-[100px]"
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute -right-[10%] bottom-[-20%] h-[400px] w-[400px] rounded-full bg-[#00C853]/10 blur-[80px]"
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="font-display text-4xl font-bold md:text-6xl tracking-tight">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="inline-block mr-3"
            >
              {word}
            </motion.span>
          ))}
        </h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mt-6 max-w-md text-lg text-white/60"
        >
          Join as a shipper, driver, or buyer — the network works better the moment you're on it.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <a
            href="/signup"
            className="rounded-lg bg-[#00C853] px-8 py-4 font-bold text-[#0A110E] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,200,83,0.4)]"
          >
            Create your account
          </a>
          <a
            href="/contact"
            className="rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 font-semibold text-white transition-all hover:bg-white/10 hover:border-white/40"
          >
            Talk to us
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
