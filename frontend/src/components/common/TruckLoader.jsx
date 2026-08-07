/**
 * TruckLoader
 * A branded loading indicator: a truck drives from the left edge of its
 * track to the right, on a loop, over a dashed "road".
 *
 * Usage:
 *   <TruckLoader />                          // full-screen overlay (default)
 *   <TruckLoader label="Fetching shipments…" />
 *   <TruckLoader fullScreen={false} />        // inline block, e.g. inside a card/section
 */

const TruckSvg = () => (
  <svg
    viewBox="0 0 120 60"
    className="h-16 w-32 animate-truck-bounce sm:h-20 sm:w-40"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* exhaust puffs */}
    <circle cx="6" cy="30" r="3" className="fill-primary/20 animate-exhaust-puff" />
    <circle
      cx="6"
      cy="30"
      r="3"
      className="fill-primary/20 animate-exhaust-puff"
      style={{ animationDelay: '0.35s' }}
    />

    {/* cargo box / trailer */}
    <rect x="10" y="12" width="62" height="30" rx="4" className="fill-primary" />
    <rect x="16" y="18" width="50" height="4" rx="2" className="fill-accent/70" />
    <rect x="16" y="26" width="50" height="4" rx="2" className="fill-accent/40" />

    {/* cab */}
    <path
      d="M74 24 H98 a5 5 0 0 1 5 5 v9 a4 4 0 0 1 -4 4 H74 Z"
      className="fill-primary"
    />
    {/* windshield */}
    <path d="M79 27 H93 a4 4 0 0 1 4 4 v3 H79 Z" className="fill-secondary" />
    {/* bumper */}
    <rect x="98" y="36" width="5" height="5" rx="1" className="fill-accent" />

    {/* chassis line */}
    <rect x="8" y="42" width="96" height="3" rx="1.5" className="fill-primary/70" />

    {/* wheels */}
    {[24, 56, 90].map((cx) => (
      <g key={cx} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} className="animate-wheel-spin">
        <circle cx={cx} cy="46" r="7" className="fill-[#1B2321]" />
        <circle cx={cx} cy="46" r="3" className="fill-secondary" />
        <rect x={cx - 0.6} y="40" width="1.2" height="12" className="fill-secondary/70" />
        <rect x={cx - 6} y="45.4" width="12" height="1.2" className="fill-secondary/70" />
      </g>
    ))}
  </svg>
);

const TruckLoader = ({ label = 'Loading…', fullScreen = true }) => {
  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-64 overflow-hidden sm:w-80">
        <div className="relative h-20 sm:h-24">
          <div className="absolute bottom-3 left-0 animate-truck-drive">
            <TruckSvg />
          </div>
        </div>

        <div
          className="h-[3px] w-full animate-road-scroll rounded-full opacity-40"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #1B4D3E 0px, #1B4D3E 20px, transparent 20px, transparent 40px)',
          }}
        />
      </div>

      <div className="mt-5 flex items-center gap-2">
        <span className="font-display text-sm font-semibold text-primary">{label}</span>
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" />
        </span>
      </div>
    </div>
  );

  if (!fullScreen) {
    return <div className="flex w-full items-center justify-center py-16">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      {content}
    </div>
  );
};

export default TruckLoader;