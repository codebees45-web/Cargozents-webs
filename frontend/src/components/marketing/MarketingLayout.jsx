import Navbar from '../landing/Navbar';
import Logo from '../common/Logo';
const MarketingLayout = ({ eyebrow, title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-6 pt-32 pb-24 md:px-16">
        <div className="mx-auto max-w-3xl">
          {eyebrow && (
            <span className="font-mono-ls text-xs tracking-[0.2em] text-primary/70">
              {eyebrow}
            </span>
          )}
          {title && (
            <h1 className="mt-4 font-display text-3xl font-bold text-primary md:text-4xl">
              {title}
            </h1>
          )}
          {subtitle && <p className="mt-3 max-w-xl text-[#5B7A70]">{subtitle}</p>}
          <div className="mt-12">{children}</div>
        </div>
      </main>
      <footer className="border-t border-primary/10 px-6 py-10 md:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <Logo size="sm" />
          <p className="font-mono-ls text-xs text-[#5B7A70]">
            &copy; {new Date().getFullYear()} LOADSHARE. BUILT FOR INDIAN FREIGHT.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;
