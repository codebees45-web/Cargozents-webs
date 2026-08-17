import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps, MAP_OPTIONS, HAS_GOOGLE_MAPS_KEY } from '../utils/googleMaps';
import NoApiKeyMap from '../components/common/NoApiKeyMap';
import DashboardLayout from '../components/common/DashboardLayout';
import api from '../services/api';
import { formatLocationFreshness } from '../utils/locationFreshness';
import { useFleetTracking } from '../hooks/useLiveTracking';

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
const POLL_INTERVAL_MS = 60000;

const isRealPoint = (coords) =>
  Array.isArray(coords) && coords.length === 2 && !(coords[0] === 0 && coords[1] === 0);

// [lng, lat] GeoJSON → { lat, lng }
const toLatLng = (coords) =>
  isRealPoint(coords) ? { lat: coords[1], lng: coords[0] } : null;

// Color-coded dot icons based on freshness
const ICON_URL = {
  live:   'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  stale:  'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  offline:'http://maps.google.com/mapfiles/ms/icons/lightblue-dot.png',
};

const iconFor = (freshnessText) => {
  if (freshnessText === 'Live') return { url: ICON_URL.live };
  if (freshnessText.startsWith('Updated')) return { url: ICON_URL.stale };
  return { url: ICON_URL.offline };
};

/**
 * Network-wide "where is everyone" map for ops staff — every verified
 * vehicle with a known position, color-coded by how fresh that position is.
 */
const AdminLiveMap = () => {
  const { isLoaded, loadError } = useGoogleMaps();
  const [vehicles, setVehicles] = useState(null);
  const [error, setError] = useState('');
  const [activeVehicleId, setActiveVehicleId] = useState(null);
  const pollRef = useRef(null);
  const mapRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/vehicles?verified=true');
      setVehicles(data.vehicles || []);
      setError('');
    } catch {
      setError('Could not load fleet locations right now.');
    }
  }, []);

  useEffect(() => {
    load();
    clearInterval(pollRef.current);
    pollRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [load]);

  useFleetTracking(true, (payload) => {
    setVehicles((prev) => {
      if (!prev) return prev;
      const idx = prev.findIndex((v) => v._id === payload.vehicleId);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        ...(payload.stopped
          ? { isSharingLocation: false }
          : {
              currentLocation: { type: 'Point', coordinates: payload.coordinates },
              locationUpdatedAt: payload.locationUpdatedAt,
              isSharingLocation: true,
            }),
      };
      return next;
    });
  });

  const located = (vehicles || []).filter((v) => isRealPoint(v.currentLocation?.coordinates));
  const liveCount = located.filter((v) => formatLocationFreshness(v).text === 'Live').length;

  const activeVehicle = activeVehicleId
    ? located.find((v) => v._id === activeVehicleId)
    : null;

  // Auto-fit to all located vehicles once loaded
  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isLoaded || !window.google || located.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    located.forEach((v) => {
      const pos = toLatLng(v.currentLocation.coordinates);
      if (pos) bounds.extend(pos);
    });
    mapRef.current.fitBounds(bounds, 60);
  }, [located.length, isLoaded]);

  return (
    <DashboardLayout title="Live fleet map" subtitle="Every verified vehicle's last known position, network-wide.">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-[#5B7A70]">
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#00E676]" /> Live ({liveCount})
        </span>
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#FBBF24]" /> Updated a while ago
        </span>
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#94A3B8]" /> Offline / stale
        </span>
        <span className="ml-auto">
          {vehicles === null ? 'Loading…' : `${located.length} of ${vehicles.length} vehicles have a location`} · live, resyncs every {POLL_INTERVAL_MS / 1000}s
        </span>
      </div>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="min-h-[520px] w-full overflow-hidden rounded-xl border border-primary/10">
        {!HAS_GOOGLE_MAPS_KEY && (
          <NoApiKeyMap
            markers={located.map((v) => {
              const pos = toLatLng(v.currentLocation.coordinates);
              return pos ? { lat: pos.lat, lng: pos.lng, label: v.registrationNumber } : null;
            }).filter(Boolean)}
            center={located.length > 0 ? toLatLng(located[0].currentLocation.coordinates) : { lat: 20.5937, lng: 78.9629 }}
            height="520px"
          />
        )}
        {HAS_GOOGLE_MAPS_KEY && loadError && (
          <div className="flex h-[520px] items-center justify-center text-sm text-[#5B7A70]">
            Map failed to load. Check your Google Maps API key.
          </div>
        )}
        {HAS_GOOGLE_MAPS_KEY && !loadError && !isLoaded && (
          <div className="flex h-[520px] items-center justify-center text-sm text-[#5B7A70]">
            Loading map…
          </div>
        )}
        {HAS_GOOGLE_MAPS_KEY && !loadError && isLoaded && (
          <GoogleMap
            mapContainerStyle={{ height: '520px', width: '100%' }}
            center={INDIA_CENTER}
            zoom={5}
            options={MAP_OPTIONS}
            onLoad={handleMapLoad}
          >
            {located.map((v) => {
              const pos = toLatLng(v.currentLocation.coordinates);
              if (!pos) return null;
              const freshness = formatLocationFreshness(v);
              return (
                <Marker
                  key={v._id}
                  position={pos}
                  icon={iconFor(freshness.text)}
                  title={v.registrationNumber}
                  onClick={() => setActiveVehicleId(v._id)}
                >
                  {activeVehicleId === v._id && activeVehicle && (
                    <InfoWindow onCloseClick={() => setActiveVehicleId(null)}>
                      <div className="text-sm">
                        <strong>{activeVehicle.registrationNumber}</strong> ({activeVehicle.type})<br />
                        Driver: {activeVehicle.driver?.name || 'Unassigned'}
                        {activeVehicle.driver?.phone && ` · ${activeVehicle.driver.phone}`}<br />
                        Agency: {activeVehicle.agency?.name || '—'}<br />
                        {freshness.text}
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              );
            })}
          </GoogleMap>
        )}
      </div>

      {vehicles !== null && located.length === 0 && (
        <p className="mt-4 text-sm text-[#5B7A70]">
          No verified vehicle has reported a location yet.
        </p>
      )}
    </DashboardLayout>
  );
};

export default AdminLiveMap;