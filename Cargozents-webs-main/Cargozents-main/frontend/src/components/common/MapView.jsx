import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Leaflet's default marker icons break when bundled (webpack/vite can't
// resolve the image paths it expects). This rebuilds them from CDN URLs
// so markers actually render instead of showing broken image icons.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// A custom truck icon, distinct from default pin markers, so moving
// vehicles are visually distinguishable from static pickup/drop points.
const truckIcon = new L.DivIcon({
  html: '🚚',
  className: 'text-2xl',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Recenters the map whenever `center` changes — needed because
// MapContainer only sets its center on first mount, not on prop updates.
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// When there's more than one marker and the caller didn't pin an explicit
// center, fit the viewport to all of them instead of just zooming in on
// the first — otherwise a pickup->drop pair that's far apart would render
// with one end off-screen.
const FitToMarkers = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(L.latLngBounds(points), { padding: [32, 32] });
  }, [JSON.stringify(points), map]);
  return null;
};

/**
 * Shared map component used across truck tracking, order tracking,
 * nearby-shippers browse, and the address picker.
 *
 * markers: [{ id, lat, lng, label, isVehicle }]
 * route: [[lat, lng], [lat, lng], ...] — optional line connecting points
 * center: [lat, lng] — optional, defaults to first marker or Chennai
 * onMapClick: (lat, lng) => void — optional, for the address picker use case
 */
const MapView = ({
  markers = [],
  route = null,
  center = null,
  zoom = 12,
  height = '400px',
  onMapClick = null,
}) => {
  const defaultCenter = center || (markers[0] ? [markers[0].lat, markers[0].lng] : [13.0827, 80.2707]); // Chennai fallback

  const ClickHandler = () => {
    const map = useMap();
    useEffect(() => {
      if (!onMapClick) return;
      const handler = (e) => onMapClick(e.latlng.lat, e.latlng.lng);
      map.on('click', handler);
      return () => map.off('click', handler);
    }, [map]);
    return null;
  };

  return (
    <div style={{ height, width: '100%' }} className="overflow-hidden rounded-xl border border-primary/10">
      <MapContainer center={defaultCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />
        {!center && <FitToMarkers points={markers.map((m) => [m.lat, m.lng])} />}
        <ClickHandler />

        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            {...(m.isVehicle ? { icon: truckIcon } : {})}
          >
            {m.label && <Popup>{m.label}</Popup>}
          </Marker>
        ))}

        {route && route.length > 1 && (
          <Polyline positions={route} pathOptions={{ color: '#1F6F5C', weight: 4 }} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;