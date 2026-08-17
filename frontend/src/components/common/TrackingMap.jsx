import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { GoogleMap, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps, MAP_OPTIONS, HAS_GOOGLE_MAPS_KEY } from '../../utils/googleMaps';
import NoApiKeyMap from './NoApiKeyMap';

// [lng, lat] GeoJSON → { lat, lng } Google Maps
const toLatLng = (coords) =>
  coords && coords.length === 2 ? { lat: coords[1], lng: coords[0] } : null;
const isRealPoint = (coords) =>
  coords && coords.length === 2 && !(coords[0] === 0 && coords[1] === 0);

// Icon URLs — no window.google reference needed
const ICON = {
  pickup:  { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
  drop:    { url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' },
  vehicle: { url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' },
};

const TrackingMap = ({ tracking, className = '', emptyMessage }) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef(null);
  const [routePath, setRoutePath] = useState(null);
  const [isFollowing, setIsFollowing] = useState(true);
  const [activeInfo, setActiveInfo] = useState(null);
  const initialFitDone = useRef(false);

  const pickup       = tracking?.pickup?.location?.coordinates;
  const drop         = tracking?.drop?.location?.coordinates;
  const vehicleCoords = tracking?.vehicle?.currentLocation?.coordinates;

  const pickupLatLng  = useMemo(() => isRealPoint(pickup)       ? toLatLng(pickup)       : null, [pickup?.[0],       pickup?.[1]]);
  const dropLatLng    = useMemo(() => isRealPoint(drop)         ? toLatLng(drop)         : null, [drop?.[0],         drop?.[1]]);
  const vehicleLatLng = useMemo(() => isRealPoint(vehicleCoords) ? toLatLng(vehicleCoords) : null, [vehicleCoords?.[0], vehicleCoords?.[1]]);

  const points = useMemo(
    () => [pickupLatLng, dropLatLng, vehicleLatLng].filter(Boolean),
    [pickupLatLng, dropLatLng, vehicleLatLng]
  );

  // Fetch road route from OSRM
  useEffect(() => {
    if (!pickup || !drop) return;
    let cancelled = false;
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup[0]},${pickup[1]};${drop[0]},${drop[1]}?overview=full&geometries=geojson`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.routes?.[0]) {
          setRoutePath(data.routes[0].geometry.coordinates.map((c) => ({ lat: c[1], lng: c[0] })));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pickup?.[0], pickup?.[1], drop?.[0], drop?.[1]]);

  const handleMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  // Initial fit to bounds
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !window.google || points.length === 0 || initialFitDone.current) return;
    if (points.length === 1) {
      mapRef.current.setCenter(points[0]);
      mapRef.current.setZoom(13);
    } else {
      const bounds = new window.google.maps.LatLngBounds();
      points.forEach((p) => bounds.extend(p));
      mapRef.current.fitBounds(bounds, 50);
    }
    initialFitDone.current = true;
  }, [points, isLoaded]);

  // Follow vehicle
  useEffect(() => {
    if (isFollowing && vehicleLatLng && mapRef.current && initialFitDone.current) {
      mapRef.current.panTo(vehicleLatLng);
    }
  }, [vehicleLatLng, isFollowing]);

  // ── No location data yet ──────────────────────────────────────────────
  if (points.length === 0) {
    return (
      <div className={`flex h-[400px] items-center justify-center rounded-lg border border-gray-300 bg-gray-100 ${className}`}>
        <div className="text-center px-6">
          <p className="font-medium text-gray-500">No location data yet</p>
          <p className="mt-1 text-sm text-gray-400">
            {emptyMessage || 'Coordinates will appear once pickup/drop points are set and the driver starts sharing location.'}
          </p>
        </div>
      </div>
    );
  }

  // ── No API key: show OSM iframe fallback ────────────────────────────
  if (!HAS_GOOGLE_MAPS_KEY) {
    const fallbackMarkers = [
      pickupLatLng && { lat: pickupLatLng.lat, lng: pickupLatLng.lng, label: 'Pickup' },
      dropLatLng   && { lat: dropLatLng.lat,   lng: dropLatLng.lng,   label: 'Drop' },
    ].filter(Boolean);
    return (
      <div className={`relative h-[400px] w-full rounded-lg overflow-hidden ${className}`}>
        <NoApiKeyMap markers={fallbackMarkers} center={fallbackMarkers[0]} height="400px" />
      </div>
    );
  }

  // ── Google Maps load error ───────────────────────────────────────────
  if (loadError) {
    return (
      <div className={`flex h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 ${className}`}>
        <p className="text-sm text-gray-500">Map failed to load. Check your Google Maps API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 ${className}`}>
        <p className="text-sm text-gray-400">Loading map…</p>
      </div>
    );
  }

  return (
    <div className={`relative h-[400px] w-full rounded-lg overflow-hidden ${className}`}>
      {vehicleLatLng && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => setIsFollowing(true)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-md transition-all ${
              isFollowing
                ? 'bg-primary text-white scale-105'
                : 'bg-white text-primary border border-primary/20 hover:bg-gray-50'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isFollowing ? 'bg-[#00E676] animate-pulse' : 'bg-gray-400'}`} />
            {isFollowing ? 'Following Vehicle' : 'Follow Vehicle'}
          </button>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={points[0]}
        zoom={12}
        options={MAP_OPTIONS}
        onLoad={handleMapLoad}
        onDragStart={() => setIsFollowing(false)}
      >
        {pickupLatLng && (
          <Marker position={pickupLatLng} icon={ICON.pickup} title="Pickup" onClick={() => setActiveInfo('pickup')}>
            {activeInfo === 'pickup' && (
              <InfoWindow onCloseClick={() => setActiveInfo(null)}>
                <div><strong>Pickup</strong><br />{tracking.pickup?.address}, {tracking.pickup?.city}</div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {dropLatLng && (
          <Marker position={dropLatLng} icon={ICON.drop} title="Drop" onClick={() => setActiveInfo('drop')}>
            {activeInfo === 'drop' && (
              <InfoWindow onCloseClick={() => setActiveInfo(null)}>
                <div><strong>Drop</strong><br />{tracking.drop?.address}, {tracking.drop?.city}</div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {vehicleLatLng && (
          <Marker position={vehicleLatLng} icon={ICON.vehicle} title={tracking.vehicle?.registrationNumber || 'Vehicle'} onClick={() => setActiveInfo('vehicle')}>
            {activeInfo === 'vehicle' && (
              <InfoWindow onCloseClick={() => setActiveInfo(null)}>
                <div>
                  <strong>{tracking.vehicle?.registrationNumber || 'Vehicle'}</strong><br />
                  {tracking.vehicle?.type}<br />
                  Status: {tracking.status}
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {routePath ? (
          <Polyline path={routePath} options={{ strokeColor: '#1B4D3E', strokeWeight: 4, strokeOpacity: 0.75 }} />
        ) : (
          pickupLatLng && dropLatLng && (
            <Polyline path={[pickupLatLng, dropLatLng]} options={{ strokeColor: '#1B4D3E', strokeWeight: 3, strokeOpacity: 0.5, strokeDasharray: '8 6' }} />
          )
        )}
      </GoogleMap>
    </div>
  );
};

export default TrackingMap;