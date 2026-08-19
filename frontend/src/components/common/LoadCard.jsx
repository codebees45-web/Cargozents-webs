import { useState } from 'react';
import api from '../../services/api';
import DriverTripMap from './DriverTripMap';

// Statuses where the driver is actively en route and should be able to
// see the route map and share their live GPS position.
const TRACKABLE_STATUSES = ['accepted', 'picked_up', 'in_transit'];

const STATUS_LABEL = {
  assigned: 'Awaiting your response',
  accepted: 'Accepted — head to pickup',
  picked_up: 'Picked up — en route',
  in_transit: 'In transit',
  delivered: 'Delivered',
  rejected: 'Rejected',
};

const NEXT_ACTION_LABEL = {
  accepted: 'Mark picked up',
  picked_up: 'Mark in transit',
  in_transit: 'Mark delivered',
};

/**
 * Reads the driver's current GPS position if available, but never blocks
 * the action on it — tracking history is still meaningful without a
 * coordinate, so we degrade gracefully rather than failing the update.
 */
const getCoordinatesIfAvailable = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(undefined);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
      () => resolve(undefined),
      { timeout: 4000 }
    );
  });

const LoadCard = ({ shipment, onUpdated }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const isTrackable = TRACKABLE_STATUSES.includes(shipment.status);

  const respond = async (accept) => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.patch(`/shipments/${shipment._id}/respond`, { accept });
      onUpdated(data.shipment);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this load.');
    } finally {
      setBusy(false);
    }
  };

  const advance = async () => {
    setBusy(true);
    setError('');
    try {
      const coordinates = await getCoordinatesIfAvailable();
      const { data } = await api.patch(`/shipments/${shipment._id}/status`, coordinates ? { coordinates } : {});
      onUpdated(data.shipment);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this load.');
    } finally {
      setBusy(false);
    }
  };

  const nextActionLabel = NEXT_ACTION_LABEL[shipment.status];

  return (
    <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono-ls text-[11px] text-[#5B7A70]">
            {shipment.pickup?.city} → {shipment.drop?.city}
          </p>
          <p className="mt-1 text-sm text-primary">{STATUS_LABEL[shipment.status] || shipment.status}</p>
          <p className="mt-1 text-xs text-[#5B7A70]">
            {shipment.goodsType} · {shipment.weight}kg · ₹{shipment.finalPrice || shipment.estimatedPrice}
            {shipment.isBackhaulMatch && <span className="ml-2 text-success">BACKHAUL MATCH</span>}
          </p>
          {shipment.shipper?.name && <p className="mt-1 text-xs text-[#5B7A70]">Shipper: {shipment.shipper.name} · {shipment.shipper.phone}</p>}
        </div>

        <div className="flex shrink-0 gap-2">
          {shipment.status === 'assigned' && (
            <>
              <button
                disabled={busy}
                onClick={() => respond(true)}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
              >
                Accept
              </button>
              <button
                disabled={busy}
                onClick={() => respond(false)}
                className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs text-danger transition hover:bg-danger/10 disabled:opacity-60"
              >
                Reject
              </button>
            </>
          )}

          {nextActionLabel && (
            <button
              disabled={busy}
              onClick={advance}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? 'Updating…' : nextActionLabel}
            </button>
          )}

          {shipment.status === 'delivered' && (
            <span className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">Delivered</span>
          )}

          {isTrackable && (
            <button
              type="button"
              onClick={() => setShowMap((v) => !v)}
              className="rounded-lg border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-primary/40"
            >
              {showMap ? 'Hide map' : 'Route & GPS'}
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-danger">{error}</p>}

      {isTrackable && showMap && <DriverTripMap shipmentId={shipment._id} />}
    </div>
  );
};

export default LoadCard;