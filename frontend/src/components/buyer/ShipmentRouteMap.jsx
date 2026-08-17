import { useEffect, useRef, useCallback, useState } from 'react';
import { GoogleMap, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps, MAP_OPTIONS, HAS_GOOGLE_MAPS_KEY } from '../../utils/googleMaps';
import NoApiKeyMap from '../common/NoApiKeyMap';
import useTracking from '../../hooks/useTracking';

/**
 * Shows pickup, delivery, and (if available) the live driver position on
 * Google Maps with a real road route drawn via OSRM.
 *
 * pickup / delivery: { lat, lng }
 * orderId: optional — enables live driver-location tracking via socket
 */
export default function ShipmentRouteMap({ pickup, delivery, orderId }) {
  const { isLoaded, loadError } = useGoogleMaps();
  const driverLocation = useTracking(orderId);
  const mapRef = useRef(null);
  const [routePath, setRoutePath] = useState(null);
  const [activeInfo, setActiveInfo] = useState(null);

  const driverLatLng = driverLocation
    ? { lat: driverLocation.lat, lng: driverLocation.lng }
    : null;

  // Fetch road route from OSRM
  useEffect(() => {
    if (!pickup || !delivery) return;
    let cancelled = false;
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${delivery.lng},${delivery.lat}?overview=full&geometries=geojson`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.routes?.[0]) {
          setRoutePath(data.routes[0].geometry.coordinates.map((c) => ({ lat: c[1], lng: c[0] })));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pickup?.lat, pickup?.lng, delivery?.lat, delivery?.lng]);

  const handleLoad = useCallback((map) => {
    mapRef.current = map;
    if (!pickup || !delivery || !window.google) return;
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: pickup.lat, lng: pickup.lng });
    bounds.extend({ lat: delivery.lat, lng: delivery.lng });
    if (driverLatLng) bounds.extend(driverLatLng);
    map.fitBounds(bounds, 50);
  }, [pickup, delivery, driverLatLng]);

  if (!pickup || !delivery) return null;

  // ── No API key: OSM fallback ───────────────────────────────────────
  if (!HAS_GOOGLE_MAPS_KEY) {
    return (
      <NoApiKeyMap
        markers={[
          { lat: pickup.lat, lng: pickup.lng, label: 'Pickup' },
          { lat: delivery.lat, lng: delivery.lng, label: 'Delivery' },
        ]}
        center={{ lat: pickup.lat, lng: pickup.lng }}
        height="400px"
      />
    );
  }

  if (loadError) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center rounded-xl border border-primary/10 bg-secondary/10 text-sm text-[#5B7A70]">
        Map failed to load. Check your Google Maps API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center rounded-xl border border-primary/10 bg-secondary/10 text-sm text-[#5B7A70]">
        Loading map…
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-xl border border-primary/10">
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={{ lat: pickup.lat, lng: pickup.lng }}
        zoom={7}
        options={MAP_OPTIONS}
        onLoad={handleLoad}
      >
        <Marker
          position={{ lat: pickup.lat, lng: pickup.lng }}
          icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
          title="Pickup"
          onClick={() => setActiveInfo('pickup')}
        >
          {activeInfo === 'pickup' && (
            <InfoWindow onCloseClick={() => setActiveInfo(null)}><span>Pickup</span></InfoWindow>
          )}
        </Marker>

        <Marker
          position={{ lat: delivery.lat, lng: delivery.lng }}
          icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
          title="Delivery"
          onClick={() => setActiveInfo('delivery')}
        >
          {activeInfo === 'delivery' && (
            <InfoWindow onCloseClick={() => setActiveInfo(null)}><span>Delivery</span></InfoWindow>
          )}
        </Marker>

        {routePath ? (
          <Polyline path={routePath} options={{ strokeColor: '#1B4D3E', strokeWeight: 4, strokeOpacity: 0.75 }} />
        ) : (
          <Polyline
            path={[{ lat: pickup.lat, lng: pickup.lng }, { lat: delivery.lat, lng: delivery.lng }]}
            options={{ strokeColor: '#1B4D3E', strokeWeight: 3, strokeOpacity: 0.6 }}
          />
        )}

        {driverLatLng && (
          <Marker
            position={driverLatLng}
            icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' }}
            title="Driver location"
            onClick={() => setActiveInfo('driver')}
          >
            {activeInfo === 'driver' && (
              <InfoWindow onCloseClick={() => setActiveInfo(null)}><span>Driver location</span></InfoWindow>
            )}
          </Marker>
        )}
      </GoogleMap>
    </div>
  );
}