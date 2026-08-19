import { useState } from 'react';
import FormInput from './FormInput';
import MapView from './MapView';
import GoogleAddressInput from './GoogleAddressInput';

/**
 * Captures one geoPoint (address/city/state/pincode/coordinates) for a
 * shipment's pickup or drop. Coordinates are required by the backend for
 * distance-based pricing and matching. Three ways to fill them in:
 * "Use my location" (browser geolocation), clicking a point on the map
 * picker below, or using the address autocomplete which auto-fills
 * city / state / pincode / coordinates in one go.
 */
const GeoPointFields = ({ label, value, onChange, onUseMyLocation, locating }) => {
  const [showPicker, setShowPicker] = useState(false);
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });
  const setCoord = (index) => (e) => {
    const coords = [...value.coordinates];
    coords[index] = e.target.value === '' ? '' : Number(e.target.value);
    onChange({ ...value, coordinates: coords });
  };

  const hasCoords = value.coordinates[0] !== '' && value.coordinates[1] !== '' && !(value.coordinates[0] === 0 && value.coordinates[1] === 0);

  const handleMapClick = (lat, lng) => {
    onChange({ ...value, coordinates: [lng, lat] });
  };

  /** Called when user picks a suggestion from the autocomplete dropdown. */
  const handleFullAddress = ({ address, line1, city, state, pincode, latitude, longitude }) => {
    onChange({
      ...value,
      address: line1 || address,
      city: city || value.city,
      state: state || value.state,
      pincode: pincode || value.pincode,
      coordinates: [longitude, latitude],
    });
  };

  const markerCenter = hasCoords ? [value.coordinates[1], value.coordinates[0]] : null;

  return (
    <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-mono-ls text-[11px] tracking-wide text-primary">{label}</h3>
        <div className="flex items-center gap-4">
          {onUseMyLocation && (
            <button
              type="button"
              onClick={onUseMyLocation}
              className="font-mono-ls text-[10px] text-primary/70 hover:text-primary hover:underline"
            >
              {locating ? 'LOCATING…' : 'USE MY LOCATION'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            className="font-mono-ls text-[10px] text-primary/70 hover:text-primary hover:underline"
          >
            {showPicker ? 'HIDE MAP' : 'PICK ON MAP'}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <GoogleAddressInput
            label="ADDRESS"
            value={value.address}
            placeholder="Start typing street, area or landmark…"
            onAddressSelect={({ address }) => onChange({ ...value, address })}
            onFullAddress={handleFullAddress}
            onChange={(text) => onChange({ ...value, address: text })}
          />
          {hasCoords && (
            <p className="mt-1 font-mono-ls text-[10px] text-success">LOCATION PINPOINTED ✓</p>
          )}
        </div>
        <FormInput label="CITY" name="city" value={value.city} onChange={set('city')} placeholder="Chennai" />
        <FormInput label="STATE" name="state" value={value.state} onChange={set('state')} placeholder="Tamil Nadu" />
        <FormInput label="PINCODE" name="pincode" value={value.pincode} onChange={set('pincode')} placeholder="600001" />
      </div>

      {showPicker && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] text-[#5B7A70]">Click anywhere on the map to set this point's coordinates.</p>
          <MapView
            markers={markerCenter ? [{ id: 'picked', lat: markerCenter[0], lng: markerCenter[1], label: value.address || label }] : []}
            center={markerCenter}
            zoom={markerCenter ? 13 : 5}
            height="280px"
            onMapClick={handleMapClick}
          />
        </div>
      )}

      {!hasCoords && (
        <p className="mt-3 text-[11px] text-warning">
          Location is needed for pricing and driver matching — search an address above, use "Use my location", or click "Pick on map".
        </p>
      )}
    </div>
  );
};

export default GeoPointFields;