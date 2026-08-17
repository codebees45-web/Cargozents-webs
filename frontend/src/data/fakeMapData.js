export const fakeTracking = {
  status: 'in_transit',
  pickup: {
    location: { coordinates: [72.8777, 19.076] },
    address: 'Marine Drive',
    city: 'Mumbai',
  },
  drop: {
    location: { coordinates: [77.5946, 12.9716] },
    address: 'MG Road',
    city: 'Bengaluru',
  },
  driver: {
    name: 'Demo Driver',
    phone: '+91 90000 00000',
  },
  vehicle: {
    registrationNumber: 'MH12AB1234',
    type: 'Container',
    currentLocation: {
      coordinates: [75.8577, 22.7196],
    },
  },
  trackingHistory: [
    { status: 'assigned', timestamp: new Date().toISOString() },
    { status: 'in_transit', timestamp: new Date().toISOString() },
  ],
};

export const fakeShipment = {
  _id: 'demo-shipment-1',
  status: 'in_transit',
  pickup: { city: 'Mumbai' },
  drop: { city: 'Bengaluru' },
  assignedVehicle: { registrationNumber: 'MH12AB1234', type: 'Container' },
};

export const fakeVehicle = {
  _id: 'demo-vehicle-1',
  registrationNumber: 'MH12AB1234',
  type: 'Container',
  driver: { name: 'Demo Driver', phone: '+91 90000 00000' },
  currentLocation: { type: 'Point', coordinates: [75.8577, 22.7196] },
  locationUpdatedAt: new Date().toISOString(),
  isSharingLocation: true,
};
