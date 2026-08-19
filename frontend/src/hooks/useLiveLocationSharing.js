import { useCallback, useEffect, useRef, useState } from 'react';
import { shareLiveLocation, stopLiveLocation } from '../services/driverService';

// Don't hit the API on every single GPS fix (the browser can fire these
// every second or two) — send at most this often...
const MIN_SEND_INTERVAL_MS = 12000;
// ...unless the driver has moved further than this since the last send,
// in which case send sooner so the map doesn't lag behind a fast-moving
// truck.
const MIN_SEND_DISTANCE_M = 80;

// Haversine distance in metres between two [lng, lat] points.
function distanceMeters([lng1, lat1], [lng2, lat2]) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Turns the driver's own phone/laptop into the GPS source for a trip,
 * using the browser's standard Geolocation API (navigator.geolocation).
 *
 * This is the same mechanism ride-hailing/delivery apps use for a
 * driver-owned device: nothing works until the driver explicitly grants
 * location permission and switches sharing on, and it stops the moment
 * they switch it off, close the tab, or the component unmounts. There's
 * no IMEI/telecom-based positioning here — accessing a phone's location
 * via the mobile network requires the carrier's cooperation (or a legal
 * order) and isn't something a web app can or should reach for.
 *
 * If Cargozents later moves to a dedicated driver mobile app or an
 * agency wires up hardware GPS trackers on their fleet, both can report
 * into the exact same `shareLiveLocation` call — this hook only owns
 * *where the coordinates come from*, not how they're stored.
 *
 * @param {{ vehicleId?: string, shipmentId?: string }} target
 */
export default function useLiveLocationSharing({ vehicleId, shipmentId } = {}) {
  const [isSharing, setIsSharing] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | requesting | active | error
  const [error, setError] = useState('');
  const [lastSentAt, setLastSentAt] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  const watchIdRef = useRef(null);
  const lastSentRef = useRef({ at: 0, coords: null });
  const targetRef = useRef({ vehicleId, shipmentId });
  targetRef.current = { vehicleId, shipmentId };

  const sendFix = useCallback((lng, lat, acc) => {
    const now = Date.now();
    const { at, coords } = lastSentRef.current;
    const elapsed = now - at;
    const moved = coords ? distanceMeters(coords, [lng, lat]) : Infinity;

    if (elapsed < MIN_SEND_INTERVAL_MS && moved < MIN_SEND_DISTANCE_M) return;

    lastSentRef.current = { at: now, coords: [lng, lat] };
    const { vehicleId: vId, shipmentId: sId } = targetRef.current;

    shareLiveLocation({ coordinates: [lng, lat], vehicleId: vId, shipmentId: sId, accuracy: acc })
      .then(() => setLastSentAt(new Date()))
      .catch(() => {
        // A single dropped ping isn't fatal — the next watchPosition
        // callback will just try again. Don't flip to an error state
        // for a transient network blip.
      });
  }, []);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsSharing(false);
    setStatus('idle');
    if (targetRef.current.vehicleId) {
      stopLiveLocation(targetRef.current.vehicleId).catch(() => {});
    }
  }, []);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setError('This device/browser does not support location access.');
      setStatus('error');
      return;
    }

    setStatus('requesting');
    setError('');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { longitude, latitude, accuracy: acc } = pos.coords;
        setAccuracy(acc);
        setStatus('active');
        setIsSharing(true);
        sendFix(longitude, latitude, acc);
      },
      (err) => {
        // PERMISSION_DENIED = 1, POSITION_UNAVAILABLE = 2, TIMEOUT = 3
        const messages = {
          1: 'Location permission was denied. Enable it in your browser/phone settings to share your trip location.',
          2: 'Could not determine your location right now (weak GPS/network signal).',
          3: 'Location request timed out. Retrying…',
        };
        setError(messages[err.code] || 'Could not access your location.');
        if (err.code !== 3) {
          setStatus('error');
          setIsSharing(false);
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  }, [sendFix]);

  const toggle = useCallback(() => {
    if (isSharing || status === 'requesting') {
      stop();
    } else {
      start();
    }
  }, [isSharing, status, start, stop]);

  // Always clean up the watch (and tell the backend sharing stopped) if
  // the component unmounts mid-trip — e.g. driver navigates away.
  useEffect(() => () => stop(), [stop]);

  return { isSharing, status, error, lastSentAt, accuracy, toggle, start, stop };
}