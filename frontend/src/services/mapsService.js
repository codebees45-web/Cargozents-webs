import api from "./api";

const mapsService = {
  calculateDistance: async (
    pickupLat,
    pickupLng,
    deliveryLat,
    deliveryLng
  ) => {
    const response = await api.post("/maps/distance", {
      pickupLat,
      pickupLng,
      deliveryLat,
      deliveryLng,
    });

    return response.data;
  },
};

export default mapsService;