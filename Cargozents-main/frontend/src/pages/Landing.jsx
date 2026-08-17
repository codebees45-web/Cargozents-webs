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
    <div className="min-h-screen bg-background">
      <CrtOverlay />
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <RolesSection />
        <CtaSection />
      </main>
      <footer className="border-t border-primary/10 px-6 py-10 md:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
               <Logo size="sm" />
          <nav className="flex gap-6 font-mono-ls text-[11px] text-[#5B7A70]">
            <a href="/faqs" className="hover:text-primary">FAQS</a>
            <a href="/terms" className="hover:text-primary">TERMS</a>
            <a href="/privacy" className="hover:text-primary">PRIVACY</a>
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
