/**
 * Renders an OpenStreetMap iframe when no Google Maps API key is configured.
 * Accepts the same core props as MapView / TrackingMap so callers can drop
 * it in as a seamless fallback.
 *
 * markers: [{ lat, lng, label }]
 * center:  { lat, lng } | [lat, lng]
 * height:  CSS string, default '400px'
 */
const NoApiKeyMap = ({ markers = [], center = null, height = '400px' }) => {
  // Resolve center
  let lat = 13.0827;
  let lng = 80.2707;
  if (center) {
    if (Array.isArray(center)) { lat = center[0]; lng = center[1]; }
    else { lat = center.lat; lng = center.lng; }
  } else if (markers[0]) {
    lat = markers[0].lat;
    lng = markers[0].lng;
  }

  // Build OSM embed URL — bbox expands ~0.05° around center so the area is visible
  const d = 0.05;
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const markerParam = markers.length > 0
    ? `&marker=${markers[0].lat},${markers[0].lng}`
    : `&marker=${lat},${lng}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${markerParam}`;

  return (
    <div style={{ height, width: '100%' }} className="relative overflow-hidden rounded-xl border border-primary/10">
      <iframe
        title="Map"
        src={src}
        style={{ height: '100%', width: '100%', border: 0 }}
        loading="lazy"
        allowFullScreen
      />
      {/* Overlay badge */}
      <div className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-3 py-1.5 text-[10px] text-[#5B7A70] shadow border border-primary/10 backdrop-blur-sm">
        🗺️ Add <code className="font-mono text-primary">VITE_GOOGLE_MAPS_API_KEY</code> in{' '}
        <code className="font-mono text-primary">frontend/.env</code> for Google Maps
      </div>
    </div>
  );
};

export default NoApiKeyMap;
