import { useJsApiLoader } from '@react-google-maps/api';

// These must be module-level constants — the @react-google-maps/api loader is
// a global singleton. Changing these options between calls (e.g. via hot
// reload) causes "Loader must not be called again with different options".
const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry'];

const RAW_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

/** True when a real-looking Google Maps API key is present */
export const HAS_GOOGLE_MAPS_KEY =
  RAW_KEY.length > 10 && RAW_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';

/**
 * Shared hook for loading the Google Maps JS SDK.
 * IMPORTANT: Always pass RAW_KEY (even when it is the placeholder) so the
 * singleton options never change between calls. The fallback to
 * OpenStreetMap is handled in each map component via HAS_GOOGLE_MAPS_KEY,
 * so <GoogleMap> is never actually rendered when the key is invalid.
 */
export function useGoogleMaps() {
  return useJsApiLoader({
    googleMapsApiKey: RAW_KEY,  // ← always consistent — never switch to ''
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
}

/** Clean map style: muted POI labels, matching the app's colour palette */
export const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { featureType: 'poi',     elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
};
