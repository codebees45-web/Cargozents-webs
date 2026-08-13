import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Vite bundles the default Leaflet marker PNGs under a hashed path
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const pickupIcon = L.divIcon({
  className: '',
  html: '<div style="background:#1B4D3E;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #1B4D3E;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const dropIcon = L.divIcon({
  className: '',
  html: '<div style="background:#EF4444;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #EF4444;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const truckIcon = L.divIcon({
  className: 'truck-marker-animated', // We'll inject CSS for this to animate
  html: '<div style="background:#00E676;width:26px;height:26px;border-radius:50%;border:3px solid #1B4D3E;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.3);">🚚</div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

// [lng, lat] (GeoJSON) -> [lat, lng] (Leaflet).
const toLatLng = (coords) => (coords && coords.length === 2 ? [coords[1], coords[0]] : null);
const isRealPoint = (coords) => coords && coords.length === 2 && !(coords[0] === 0 && coords[1] === 0);

// Helper component to handle auto-following the vehicle and zooming to bounds on first load
const MapController = ({ points, vehicleLatLng, isFollowing, setIsFollowing }) => {
  const map = useMap();
  const initialFitDone = useRef(false);

  // Initial fit to bounds
  useEffect(() => {
    if (points.length === 0 || initialFitDone.current) return;
    if (points.length === 1) {
      map.setView(points[0], 12);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
    initialFitDone.current = true;
  }, [points, map]);

  // Follow mode: smoothly pan to vehicle location when it changes
  useEffect(() => {
    if (isFollowing && vehicleLatLng && initialFitDone.current) {
      map.panTo(vehicleLatLng, { animate: true, duration: 1.5 });
    }
  }, [vehicleLatLng, isFollowing, map]);

  // Disable follow mode if user interacts with the map
  useEffect(() => {
    const handleDragStart = () => setIsFollowing(false);
    map.on('dragstart', handleDragStart);
    return () => map.off('dragstart', handleDragStart);
  }, [map, setIsFollowing]);

  return null;
};

const TrackingMap = ({ tracking, className = '', emptyMessage }) => {
  const [routeCoords, setRouteCoords] = useState(null);
  const [isFollowing, setIsFollowing] = useState(true);

  const pickup = tracking?.pickup?.location?.coordinates;
  const drop = tracking?.drop?.location?.coordinates;
  const vehicleCoords = tracking?.vehicle?.currentLocation?.coordinates;

  const pickupLatLng = useMemo(() => isRealPoint(pickup) ? toLatLng(pickup) : null, [pickup?.[0], pickup?.[1]]);
  const dropLatLng = useMemo(() => isRealPoint(drop) ? toLatLng(drop) : null, [drop?.[0], drop?.[1]]);
  const vehicleLatLng = useMemo(() => isRealPoint(vehicleCoords) ? toLatLng(vehicleCoords) : null, [vehicleCoords?.[0], vehicleCoords?.[1]]);

  const points = useMemo(() => [pickupLatLng, dropLatLng, vehicleLatLng].filter(Boolean), [pickupLatLng, dropLatLng, vehicleLatLng]);

  // Fetch actual driving route from OSRM
  useEffect(() => {
    if (!pickup || !drop) return;
    let isCancelled = false;
    
    // OSRM expects longitude,latitude
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup[0]},${pickup[1]};${drop[0]},${drop[1]}?overview=full&geometries=geojson`;
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.routes && data.routes.length > 0) {
          // GeoJSON coordinates are [lng, lat], Leaflet needs [lat, lng]
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRouteCoords(coords);
        }
      })
      .catch((err) => console.error("Error fetching route from OSRM:", err));

    return () => { isCancelled = true; };
  }, [pickup, drop]);

  if (points.length === 0) {
    return (
      <div className={`flex h-[400px] items-center justify-center rounded-lg border border-gray-300 bg-gray-100 ${className}`}>
        <div className="text-center px-6">
          <p className="font-medium text-gray-500">No location data yet</p>
          <p className="mt-1 text-sm text-gray-400">
            {emptyMessage ||
              "Coordinates will appear once pickup/drop points are set and the driver's device starts sharing location."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-[400px] w-full rounded-lg overflow-hidden ${className}`}>
      {/* Inject CSS for smooth marker transitions directly so it works instantly */}
      <style>{`
        .truck-marker-animated {
          transition: transform 1.5s ease-out;
          z-index: 1000 !important;
        }
      `}</style>
      
      {vehicleLatLng && (
        <div className="absolute top-4 left-4 z-[400]">
          <button
            onClick={() => setIsFollowing(true)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-md transition-all ${
              isFollowing 
                ? 'bg-primary text-white scale-105' 
                : 'bg-white text-primary border border-primary/20 hover:bg-gray-50'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isFollowing ? 'bg-success animate-pulse' : 'bg-gray-400'}`}></span>
            {isFollowing ? 'Following Vehicle' : 'Follow Vehicle'}
          </button>
        </div>
      )}

      <MapContainer center={points[0]} zoom={12} scrollWheelZoom className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapController 
          points={points} 
          vehicleLatLng={vehicleLatLng} 
          isFollowing={isFollowing} 
          setIsFollowing={setIsFollowing} 
        />

        {pickupLatLng && (
          <Marker position={pickupLatLng} icon={pickupIcon}>
            <Popup>
              <strong>Pickup</strong>
              <br />
              {tracking.pickup.address}, {tracking.pickup.city}
            </Popup>
          </Marker>
        )}

        {dropLatLng && (
          <Marker position={dropLatLng} icon={dropIcon}>
            <Popup>
              <strong>Drop</strong>
              <br />
              {tracking.drop.address}, {tracking.drop.city}
            </Popup>
          </Marker>
        )}

        {/* Draw the real road route if loaded, otherwise fallback to straight dashed line */}
        {routeCoords ? (
          <Polyline positions={routeCoords} pathOptions={{ color: '#1B4D3E', weight: 4, opacity: 0.7 }} />
        ) : (
          pickupLatLng && dropLatLng && (
            <Polyline positions={[pickupLatLng, dropLatLng]} pathOptions={{ color: '#1B4D3E', weight: 3, dashArray: '6 8' }} />
          )
        )}

        {vehicleLatLng && (
          <Marker position={vehicleLatLng} icon={truckIcon}>
            <Popup>
              <strong>{tracking.vehicle?.registrationNumber || 'Vehicle'}</strong>
              <br />
              {tracking.vehicle?.type}
              <br />
              Status: {tracking.status}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default TrackingMap;