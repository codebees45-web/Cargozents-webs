import { useState, useEffect } from 'react';
import Logo from '../common/Logo';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="relative flex h-8 w-14 items-center rounded-full border border-primary/20 bg-secondary/60 px-1 transition"
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] transition-transform ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {isDark ? '' : ''}
      </span>
    </button>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 z-50 w-full px-6 py-4 transition-all duration-300 md:px-16 ${
        isScrolled 
          ? 'border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm' 
          : 'border-transparent bg-white/50 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <a href="/" className="transition hover:opacity-80">
          <Logo />
        </a>
        <nav className="hidden gap-6 font-mono-ls text-[13px] text-[#5B7A70] md:flex">
          <a href="/about" className="relative py-1 transition hover:text-[#0A261D]">ABOUT</a>
          <a href="/how-it-works" className="relative py-1 transition hover:text-[#0A261D]">HOW IT WORKS</a>
          <a href="/industries" className="relative py-1 transition hover:text-[#0A261D]">INDUSTRIES</a>
          <a href="/pricing" className="relative py-1 transition hover:text-[#0A261D]">PRICING</a>
          <a href="/contact" className="relative py-1 transition hover:text-[#0A261D]">CONTACT</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="/login" className="rounded-lg px-4 py-2 text-sm font-bold text-[#0A261D] transition hover:text-[#00C853]">
            Log in
          </a>
          <a href="/signup" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-glow">
            Sign up
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;