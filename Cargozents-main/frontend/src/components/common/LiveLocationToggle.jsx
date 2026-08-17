import { useEffect, useState } from 'react';
import useLiveLocationSharing from '../../hooks/useLiveLocationSharing';

const timeAgo = (date) => {
  if (!date) return null;
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
};

/**
 * Drop this into a driver's view of a single active shipment (accepted /
 * picked_up / in_transit). Turns their own device into the live GPS
 * source for that trip's tracking map — see useLiveLocationSharing for
 * how the coordinates are captured and sent.
 */
const LiveLocationToggle = ({ vehicleId, shipmentId }) => {
  const { isSharing, status, error, lastSentAt, accuracy, toggle } = useLiveLocationSharing({
    vehicleId,
    shipmentId,
  });

  // Re-render every few seconds while active so "12s ago" stays honest
  // without a full data refetch.
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!isSharing) return undefined;
    const id = setInterval(() => forceTick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, [isSharing]);

  const ago = timeAgo(lastSentAt);
  const stale = isSharing && lastSentAt && Date.now() - lastSentAt.getTime() > 60000;

  return (
    <div className="rounded-lg border border-primary/10 bg-secondary/10 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono-ls text-[11px] text-[#5B7A70]">LIVE LOCATION</p>
          <p className="mt-1 text-sm text-primary">
            {status === 'requesting' && 'Requesting location permission…'}
            {status === 'active' && !stale && `Sharing${ago ? ` · updated ${ago}` : ''}`}
            {status === 'active' && stale && `Signal weak · last update ${ago}`}
            {status === 'idle' && "Off — the shipper can't see this vehicle move"}
            {status === 'error' && (error || 'Could not access location')}
          </p>
          {isSharing && accuracy != null && (
            <p className="mt-0.5 text-[11px] text-[#5B7A70]">±{Math.round(accuracy)}m accuracy</p>
          )}
        </div>
        <button
          type="button"
          onClick={toggle}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            isSharing ? 'bg-success text-dark' : 'border border-primary/20 text-primary'
          }`}
        >
          {isSharing ? 'Sharing' : 'Share location'}
        </button>
      </div>

      {status === 'error' && error?.includes('denied') && (
        <p className="mt-2 text-[11px] text-danger">
          You'll need to allow location access for this site in your browser settings, then try again.
        </p>
      )}
    </div>
  );
};

export default LiveLocationToggle;