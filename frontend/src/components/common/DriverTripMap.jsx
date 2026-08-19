import { useCallback, useEffect, useRef, useState } from 'react';
import TrackingMap from './TrackingMap';
import LiveLocationToggle from './LiveLocationToggle';
import { getShipmentTracking } from '../../services/shipmentService';
import useLiveTracking from '../../hooks/useLiveTracking';

const POLL_INTERVAL_MS = 45000;

/**
 * Drop this into a driver's view of a single active load (accepted /
 * picked_up / in_transit). Shows the pickup->drop route plus the last
 * known vehicle position, and — via LiveLocationToggle — lets the driver
 * turn their own device into that vehicle's live GPS source.
 */
const DriverTripMap = ({ shipmentId }) => {
  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await getShipmentTracking(shipmentId);
      setTracking(data.tracking);
      setError('');
    } catch {
      setError('Could not load the live map for this load.');
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

  return (
    <div className="mt-4 space-y-3">
      {error && <p className="text-xs text-danger">{error}</p>}
      <TrackingMap tracking={tracking} className="shadow border border-primary/10" />
      <LiveLocationToggle vehicleId={tracking?.vehicle?.id} shipmentId={shipmentId} />
    </div>
  );
};

export default DriverTripMap;