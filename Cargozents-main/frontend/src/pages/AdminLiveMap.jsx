import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import DashboardLayout from '../components/common/DashboardLayout';
import api from '../services/api';
import { formatLocationFreshness } from '../utils/locationFreshness';
import { useFleetTracking } from '../hooks/useLiveTracking';

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

const truckIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="background:${color};width:22px;height:22px;border-radius:50%;border:3px solid #1B4D3E;display:flex;align-items:center;justify-content:center;font-size:12px;">🚚</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

const LIVE_ICON = truckIcon('#00E676');
const STALE_ICON = truckIcon('#FBBF24');
const OFFLINE_ICON = truckIcon('#94A3B8');

const INDIA_CENTER = [20.5937, 78.9629];
const POLL_INTERVAL_MS = 60000;

const isRealPoint = (coords) =>
  Array.isArray(coords) && coords.length === 2 && !(coords[0] === 0 && coords[1] === 0);
const toLatLng = (coords) => (isRealPoint(coords) ? [coords[1], coords[0]] : null);

const iconFor = (freshnessText) => {
  if (freshnessText === 'Live') return LIVE_ICON;
  if (freshnessText.startsWith('Updated')) return STALE_ICON;
  return OFFLINE_ICON;
};

/**
 * Network-wide "where is everyone" map for ops staff — every verified
 * vehicle with a known position, color-coded by how fresh that position
 * is. Read-only; sits alongside the agency's per-fleet map
 * (AgencyFleetTracking) and the per-shipment tracking views, but this one
 * spans the whole platform.
 */
const AdminLiveMap = () => {
  const [vehicles, setVehicles] = useState(null);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

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

  // One shared 'fleet' room, rather than joining a room per vehicle —
  // this screen can have dozens of vehicles on it at once. Only patches
  // vehicles already in the loaded list; a newly-online vehicle shows up
  // on the next poll.
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
  const points = located.map((v) => toLatLng(v.currentLocation.coordinates));

  const liveCount = located.filter((v) => formatLocationFreshness(v).text === 'Live').length;

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
        <MapContainer center={INDIA_CENTER} zoom={5} scrollWheelZoom className="h-[520px] w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {located.map((v, idx) => {
            const freshness = formatLocationFreshness(v);
            return (
              <Marker key={v._id} position={points[idx]} icon={iconFor(freshness.text)}>
                <Popup>
                  <strong>{v.registrationNumber}</strong> ({v.type})
                  <br />
                  Driver: {v.driver?.name || 'Unassigned'}
                  {v.driver?.phone && ` · ${v.driver.phone}`}
                  <br />
                  Agency: {v.agency?.name || '—'}
                  <br />
                  {freshness.text}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
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