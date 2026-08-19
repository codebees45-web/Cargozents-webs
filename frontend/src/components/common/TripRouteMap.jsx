import { useEffect, useState } from 'react';
import TrackingMap from './TrackingMap';
import { getShipmentTracking } from '../../services/shipmentService';

/**
 * Drop this into a closed-out trip (delivered/rejected/cancelled) to show
 * the pickup->drop route plus wherever the vehicle last reported from.
 * Unlike DriverTripMap, this fetches once and doesn't poll — the trip is
 * over, so there's nothing live left to refresh.
 */
const TripRouteMap = ({ shipmentId }) => {
  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getShipmentTracking(shipmentId)
      .then(({ data }) => {
        if (cancelled) return;
        setTracking(data.tracking);
        setError('');
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the route for this trip.');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [shipmentId]);

  return (
    <div className="mt-4 space-y-2">
      {error && <p className="text-xs text-danger">{error}</p>}
      {loading ? (
        <p className="text-xs text-[#5B7A70]">Loading route…</p>
      ) : (
        <TrackingMap
          tracking={tracking}
          className="shadow border border-primary/10"
          emptyMessage="No location data was recorded for this trip."
        />
      )}
    </div>
  );
};

export default TripRouteMap;