/**
 * Decorative CRT-screen effect: subtle flicker + a one-time "power on"
 * warp when it mounts. No scanlines — pointer-events disabled so it
 * never blocks clicks on the content beneath it.
 */
const CrtOverlay = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] animate-crt-turn-on overflow-hidden"
    >
      <div className="absolute inset-0 animate-crt-flicker bg-black/[0.02]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)',
        }}
      />
    </div>
  );
};

export default CrtOverlay;