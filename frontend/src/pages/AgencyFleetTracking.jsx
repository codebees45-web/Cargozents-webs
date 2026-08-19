import { useEffect, useState } from 'react';
import MapView from '../components/common/MapView';
import { getFleetVehicles, setVehicleLocation } from '../services/agencyService';
import { formatLocationFreshness } from '../utils/locationFreshness';

const isRealPoint = (c) => Array.isArray(c) && c.length === 2 && !(c[0] === 0 && c[1] === 0);
const toLatLng = (c) => (isRealPoint(c) ? [c[1], c[0]] : null);

const AgencyFleetTracking = () => {
  const [vehicles, setVehicles] = useState(null);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [pickedLatLng, setPickedLatLng] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = () => {
    getFleetVehicles()
      .then(({ data }) => setVehicles(data.vehicles || []))
      .catch(() => setError('Could not load your fleet right now.'));
  };

  useEffect(load, []);

  const selected = vehicles?.find((v) => v._id === selectedId);

  const openPicker = (vehicle) => {
    setSelectedId(vehicle._id);
    setPickedLatLng(toLatLng(vehicle.currentLocation?.coordinates) || null);
    setSaveError('');
  };

  const save = async () => {
    if (!selected || !pickedLatLng) return;
    setSaving(true);
    setSaveError('');
    try {
      const coordinates = [pickedLatLng[1], pickedLatLng[0]];
      await setVehicleLocation(selected._id, coordinates);
      setSelectedId(null);
      load();
    } catch {
      setSaveError('Could not save that location. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Fleet Locations</h1>
          <p className="text-xs text-[#5B7A70] mt-1">For drivers without a smartphone, set their position by hand.</p>
        </div>
      </div>

      {error && <p className="text-sm text-danger font-semibold">{error}</p>}
      {vehicles === null && !error && <p className="text-sm text-[#5B7A70]">Loading fleet…</p>}
      {vehicles?.length === 0 && <p className="text-sm text-[#5B7A70]">No vehicles registered in your fleet yet.</p>}

      <div className="grid gap-3">
        {vehicles?.map((v) => {
          const freshness = formatLocationFreshness(v);
          return (
            <div key={v._id} className="flex items-center justify-between rounded-xl border border-primary/10 bg-secondary/10 p-4 transition-all hover:border-primary/20">
              <div>
                <p className="font-bold text-primary">{v.registrationNumber} · <span className="capitalize text-primary/70 text-xs font-mono">{v.type}</span></p>
                <p className="text-xs text-[#5B7A70] mt-0.5">{v.driver?.name} · {v.driver?.phone}</p>
                <p className={`mt-1.5 text-[11px] font-medium ${freshness.tone}`}>{freshness.text}</p>
              </div>
              <button
                type="button"
                onClick={() => openPicker(v)}
                className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-primary transition hover:shadow-glow"
              >
                Set location
              </button>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-primary/10 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-primary/10 pb-3">
              <h2 className="font-bold text-primary text-lg">
                Set location for <span className="text-primary/70">{selected.registrationNumber}</span>
              </h2>
              <button type="button" onClick={() => setSelectedId(null)} className="text-sm text-[#5B7A70] hover:text-primary transition-colors">
                ✕ Close
              </button>
            </div>
            <p className="mb-4 text-xs text-[#5B7A70]">Click on the map where the vehicle currently is, then click save.</p>

            <MapView
              markers={pickedLatLng ? [{ id: 'picked', lat: pickedLatLng[0], lng: pickedLatLng[1], label: selected.registrationNumber }] : []}
              center={pickedLatLng || [20.5937, 78.9629]}
              zoom={pickedLatLng ? 12 : 5}
              height="380px"
              onMapClick={(lat, lng) => setPickedLatLng([lat, lng])}
            />

            {saveError && <p className="mt-3 text-xs text-danger font-semibold">{saveError}</p>}

            <div className="mt-5 flex justify-end gap-3 border-t border-primary/10 pt-4">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-lg border border-primary/15 px-4 py-2 text-xs font-semibold text-primary/70 hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!pickedLatLng || saving}
                className="rounded-lg bg-accent px-5 py-2 text-xs font-bold text-primary transition hover:shadow-glow disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save position'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyFleetTracking;