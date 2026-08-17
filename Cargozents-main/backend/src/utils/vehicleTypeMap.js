const BUYER_VEHICLE_TO_BACKEND_TYPE = {
  "Pickup Truck": "open_body",
  "Mini Truck": "mini_truck",
  "Light Commercial Truck": "tempo",
  "Container Truck": "container",
  Trailer: "trailer",
};
export const mapBuyerVehicleToBackendType = (name) =>
  BUYER_VEHICLE_TO_BACKEND_TYPE[name] || "mini_truck";