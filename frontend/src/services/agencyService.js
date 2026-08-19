import api from './api';

export const getAgencyDashboard = () => api.get('/agency/dashboard');

export const getAgencyDrivers = () => api.get('/agency/drivers');

export const lookupDriverByPhone = (phone) => api.get(`/agency/drivers/lookup/${phone}`);

export const addAgencyDriver = (phone) => api.post('/agency/drivers', { phone });

export const removeAgencyDriver = (driverId) => api.delete(`/agency/drivers/${driverId}`);

export const getAgencyTrucks = () => api.get('/agency/trucks');

export const addAgencyTruck = (payload) => api.post('/agency/trucks', payload);

export const updateAgencyTruck = (id, payload) => api.patch(`/agency/trucks/${id}`, payload);

export const deleteAgencyTruck = (id) => api.delete(`/agency/trucks/${id}`);

export const getAgencyFleetStats = () => api.get('/agency/fleet-stats');

export const getFleetVehicles = () => api.get('/agency/fleet-vehicles');

export const setVehicleLocation = (vehicleId, coordinates) =>
  api.patch(`/agency/fleet-vehicles/${vehicleId}/location`, { coordinates });