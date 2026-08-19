import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import TrackingMap from '../components/common/TrackingMap';
import { getShipmentTracking } from '../services/shipmentService';
import { formatLocationFreshness } from '../utils/locationFreshness';
import useLiveTracking from '../hooks/useLiveTracking';

// Socket pushes now carry the live position; polling is just the slow
// fallback for status/driver changes, so it can be spaced out further.
const POLL_INTERVAL_MS = 45000;

const formatStatus = (status) => (status || '').replace(/_/g, ' ');

/**
 * "Where is my truck" for a shipper — same live map as the buyer's order
 * tracking page, but backed directly by the shipment (works for both
 * catalog-order shipments and raw shipments a shipper posted themselves).
 */
const ShipperShipmentTracking = () => {
  const { shipmentId } = useParams();

  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await getShipmentTracking(shipmentId);
      setTracking(data.tracking);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load tracking for this shipment.');
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    load();
    clearInterval(pollRef.current);
    pollRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [load]);

  useLiveTracking(tracking?.vehicle?.id, (payload) => {
    setTracking((prev) => {
      if (!prev?.vehicle) return prev;
      return {
        ...prev,
        vehicle: {
          ...prev.vehicle,
          ...(payload.stopped
            ? { isSharingLocation: false }
            : {
                currentLocation: { type: 'Point', coordinates: payload.coordinates },
                locationUpdatedAt: payload.locationUpdatedAt,
                isSharingLocation: true,
              }),
        },
      };
    });
  });

  const freshness = tracking?.vehicle ? formatLocationFreshness(tracking.vehicle) : null;

  return (
    <DashboardLayout
      title="Track shipment"
      subtitle={tracking ? `${tracking.pickup?.city || '—'} → ${tracking.drop?.city || '—'}` : ''}
    >
      <Link to="/shipper/shipments" className="text-sm text-primary underline">
        &larr; Back to shipments
      </Link>

      {loading && <p className="mt-6 text-sm text-[#5B7A70]">Loading…</p>}
      {error && !loading && <p className="mt-6 text-sm text-danger">{error}</p>}

      {!loading && !error && tracking && (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold capitalize text-primary">
              {formatStatus(tracking.status)}
            </span>
            {freshness && <span className={`text-xs ${freshness.tone}`}>{freshness.text}</span>}
            <span className="ml-auto text-xs text-[#5B7A70]">Live position · refreshes every {POLL_INTERVAL_MS / 1000}s</span>
          </div>

          <TrackingMap tracking={tracking} className="shadow border border-primary/10" />

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-primary/10 bg-secondary/20 p-3">
              <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">SHIPMENT STATUS</p>
              <p className="mt-1 text-sm font-semibold capitalize text-primary">{formatStatus(tracking.status)}</p>
            </div>
            <div className="rounded-lg border border-primary/10 bg-secondary/20 p-3">
              <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">DRIVER</p>
              <p className="mt-1 text-sm font-semibold text-primary">{tracking.driver?.name || 'Not yet assigned'}</p>
              {tracking.driver?.phone && <p className="text-xs text-[#5B7A70]">{tracking.driver.phone}</p>}
            </div>
            <div className="rounded-lg border border-primary/10 bg-secondary/20 p-3">
              <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">VEHICLE</p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {tracking.vehicle?.registrationNumber || '—'}
              </p>
              {tracking.vehicle?.type && <p className="text-xs text-[#5B7A70]">{tracking.vehicle.type}</p>}
            </div>
          </div>

          {tracking.trackingHistory?.length > 0 && (
            <div className="mt-6">
              <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">STATUS TIMELINE</p>
              <ul className="mt-3 space-y-2 rounded-xl border border-primary/10 bg-secondary/10 p-4">
                {[...tracking.trackingHistory].reverse().map((entry, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-primary">{formatStatus(entry.status)}</span>
                    <span className="text-xs text-[#5B7A70]">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ShipperShipmentTracking;