const Logo = ({ size = 'md', dark = false }) => {
  const sizes = {
    sm: { icon: 18, text: 'text-sm' },
    md: { icon: 22, text: 'text-lg' },
    lg: { icon: 28, text: 'text-2xl' },
  };
  const { icon, text } = sizes[size];
  const wordColor = dark ? 'text-white' : 'text-primary';
  const tailColor = dark ? 'text-white/60' : 'text-primary/55';

  return (
    <span className="inline-flex items-center gap-2">
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 9C4 6.5 6 4.5 8.5 4.5H15" stroke="#00E676" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12 2L15.5 4.5L12 7" stroke="#00E676" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 15C20 17.5 18 19.5 15.5 19.5H9" stroke="#00E676" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
        <path d="M12 22L8.5 19.5L12 17" stroke="#00E676" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      </svg>
      <span className={`font-display font-bold tracking-tight ${text} ${wordColor}`}>
        Cargo<span className={tailColor}>zents</span>
      </span>
    </span>
  );
};

export default Logo;