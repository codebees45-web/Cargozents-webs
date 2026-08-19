import api from './api';

// Shipper: shipments they've posted.
export const getMyShipments = () => api.get('/shipments/mine');

// Driver: shipments assigned to them.
export const getAssignedShipments = () => api.get('/shipments/assigned-to-me');

// Agency: shipments assigned to any vehicle in their fleet.
export const getAgencyShipments = () => api.get('/shipments/agency-fleet');

// Any authorized viewer (shipper/driver/admin/buyer-via-order):
// pickup/drop points, assigned vehicle's last-known position, and the
// full status breadcrumb trail for one shipment.
export const getShipmentTracking = (id) => api.get(`/shipments/${id}/track`);

export const getShipmentById = (id) => api.get(`/shipments/${id}`);