import { useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { useGoogleMaps, MAP_OPTIONS, HAS_GOOGLE_MAPS_KEY } from '../../utils/googleMaps';
import NoApiKeyMap from './NoApiKeyMap';

const CHENNAI = { lat: 13.0827, lng: 80.2707 };

const ICON = {
  default: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
  vehicle: { url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' },
};

/**
 * Shared Google Maps component used across truck tracking, order tracking,
 * nearby-shippers browse, and the address picker (GeoPointFields).
 *
 * markers: [{ id, lat, lng, label, isVehicle }]
 * route:   [[lat, lng], ...] — optional polyline
 * center:  { lat, lng } | [lat, lng] — defaults to first marker or Chennai
 * onMapClick: (lat, lng) => void — for the address picker use case
 */
const MapView = ({
  markers = [],
  route = null,
  center = null,
  zoom = 12,
  height = '400px',
  onMapClick = null,
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef(null);

  // Normalise center → { lat, lng }
  const normCenter = center
    ? Array.isArray(center)
      ? { lat: center[0], lng: center[1] }
      : center
    : markers[0]
    ? { lat: markers[0].lat, lng: markers[0].lng }
    : CHENNAI;

  // Auto-fit when multiple markers and no explicit center
  useEffect(() => {
    if (!mapRef.current || !window.google || markers.length < 2 || center) return;
    const bounds = new window.google.maps.LatLngBounds();
    markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
    mapRef.current.fitBounds(bounds, 40);
  }, [markers, center]);

  const handleClick = useCallback(
    (e) => { if (onMapClick) onMapClick(e.latLng.lat(), e.latLng.lng()); },
    [onMapClick]
  );

  // ── No API key: OSM iframe fallback ──────────────────────────────────
  if (!HAS_GOOGLE_MAPS_KEY) {
    return (
      <NoApiKeyMap
        markers={markers.map((m) => ({ lat: m.lat, lng: m.lng, label: m.label }))}
        center={normCenter}
        height={height}
      />
    );
  }

  if (loadError) {
    return (
      <div style={{ height }} className="flex items-center justify-center rounded-xl border border-primary/10 bg-secondary/10 text-sm text-[#5B7A70]">
        Map failed to load. Check your Google Maps API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ height }} className="flex items-center justify-center rounded-xl border border-primary/10 bg-secondary/10 text-sm text-[#5B7A70]">
        Loading map…
      </div>
    );
  }

  const routePath = route
    ? route.map((p) => (Array.isArray(p) ? { lat: p[0], lng: p[1] } : p))
    : null;

  return (
    <div style={{ height, width: '100%' }} className="overflow-hidden rounded-xl border border-primary/10">
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={normCenter}
        zoom={zoom}
        options={{ ...MAP_OPTIONS, draggableCursor: onMapClick ? 'crosshair' : undefined }}
        onClick={onMapClick ? handleClick : undefined}
        onLoad={(map) => { mapRef.current = map; }}
      >
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={{ lat: m.lat, lng: m.lng }}
            icon={m.isVehicle ? ICON.vehicle : ICON.default}
            title={m.label || undefined}
          />
        ))}

        {routePath && routePath.length > 1 && (
          <Polyline path={routePath} options={{ strokeColor: '#1F6F5C', strokeWeight: 4, strokeOpacity: 0.85 }} />
        )}
      </GoogleMap>
    </div>
  );
};

export default MapView;