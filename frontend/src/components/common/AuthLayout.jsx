import Logo from './Logo';
const AuthLayout = ({ eyebrow, title, subtitle, children }) => {
  return (
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Full-screen Video Background */}
      <div className="absolute inset-0 z-0 bg-[#0A110E]">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src="/TruckVideo.mp4" type="video/mp4" />
        </video>
        
        {/* Subtle uniform overlay for form readability without heavy shadows */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      </div>

      {/* Centered Form */}
      <div className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col items-center text-white">
        <a href="/" className="mb-10 transition hover:opacity-80">
          <Logo dark={true} />
        </a>
        
        <div className="w-full text-center">
          <span className="font-mono-ls text-xs tracking-[0.2em] text-[#00E676]">
            {eyebrow}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-white/70">{subtitle}</p>}
          
          <div className="mt-10 w-full text-left">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
