import api from './api';

// Pushes one GPS fix from the driver's own device up to the backend.
// coords: { coordinates: [lng, lat], vehicleId?, shipmentId?, accuracy? }
export const shareLiveLocation = (coords) => api.patch('/drivers/location', coords);

// Explicitly flips the vehicle's isSharingLocation flag off, so the
// tracking map shows "sharing stopped" immediately instead of guessing
// from a stale timestamp.
export const stopLiveLocation = (vehicleId) => api.patch('/drivers/location/stop', { vehicleId });

// Runs the Parivahan (Sarathi/VAHAN) automated check against a
// driving_license or rc document the driver already uploaded.
// payload: {} for rc, or { dob: 'YYYY-MM-DD', dlNumber? } for driving_license.
export const verifyDocumentWithParivahan = (documentId, payload = {}) =>
  api.post(`/drivers/documents/${documentId}/verify-parivahan`, payload);