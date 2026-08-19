import api from "./api";

const pricingService = {
  calculatePrice: async (payload) => {
    const response = await api.post("/pricing/calculate", payload);
    return response.data;
  },
};

export default pricingService;