import Logo from './Logo';
import AnimatedStorybookRoute from './AnimatedStorybookRoute';
const AuthLayout = ({ eyebrow, title, subtitle, children }) => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left: form */}
      <div className="flex w-full flex-col justify-center px-6 py-16 md:w-1/2 md:px-16">
        <a href="/" className="transition hover:opacity-80">
          <Logo />
        </a>
        <div className="mt-14 max-w-sm">
          <span className="font-mono-ls text-xs tracking-[0.2em] text-primary/80">
            {eyebrow}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold text-primary">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-[#5B7A70]">{subtitle}</p>}
          <div className="mt-10">{children}</div>
        </div>
      </div>

      {/* Right: animated storybook route panel, hidden on mobile */}
<div className="relative hidden w-1/2 items-center justify-center border-l border-primary/10 bg-secondary/30 md:flex">
  <AnimatedStorybookRoute />
</div>
    </div>
  );
};

export default AuthLayout;
