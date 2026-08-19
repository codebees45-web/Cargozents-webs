import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import ProblemSection from '../components/landing/ProblemSection';
import HowItWorks from '../components/landing/HowItWorks';
import RolesSection from '../components/landing/RolesSection';
import CtaSection from '../components/landing/CtaSection';
import Logo from '../components/common/Logo';
import CrtOverlay from '../components/common/CrtOverlay';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <CrtOverlay />
      <Navbar />
      <main>
        {/* Light Section */}
        <Hero />
        
        {/* Blend Light -> Dark */}
        <div className="h-32 w-full bg-gradient-to-b from-white to-[#0A110E]"></div>
        
        {/* Dark Navy Section */}
        <div className="dark bg-[#0A110E] text-white relative">
          <ProblemSection />
        </div>
        
        {/* Blend Dark -> Light */}
        <div className="h-32 w-full bg-gradient-to-b from-[#0A110E] to-white"></div>
        
        {/* Light Section */}
        <div className="bg-white text-primary relative">
          <HowItWorks />
        </div>
        
        {/* Blend Light -> Dark */}
        <div className="h-32 w-full bg-gradient-to-b from-white to-[#0A110E]"></div>
        
        {/* Dark Navy Section */}
        <div className="dark bg-[#0A110E] text-white relative">
          <RolesSection />
        </div>
        
        {/* Dark Section (CTA) */}
        <div className="dark bg-[#0A110E] text-white relative">
          <CtaSection />
        </div>
      </main>
      
      <footer className="border-t border-primary/10 bg-background px-6 py-10 md:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <Logo size="sm" />
          <nav className="flex gap-6 font-mono-ls text-[11px] text-[#5B7A70]">
            <a href="/faqs" className="transition-colors hover:text-primary">FAQS</a>
            <a href="/terms" className="transition-colors hover:text-primary">TERMS</a>
            <a href="/privacy" className="transition-colors hover:text-primary">PRIVACY</a>
          </nav>
          <p className="font-mono-ls text-xs text-[#5B7A70]">
            &copy; {new Date().getFullYear()} LOADSHARE. BUILT FOR INDIAN FREIGHT.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
