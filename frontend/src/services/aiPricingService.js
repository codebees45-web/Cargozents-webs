import api from "./api";

const aiPricingService = {
  /**
   * @param {Object} payload
   * @param {[number, number]} payload.pickupCoordinates [lng, lat]
   * @param {[number, number]} payload.dropCoordinates [lng, lat]
   * @param {string} payload.pickupState
   * @param {string} payload.dropState
   * @param {number} payload.weight kg
   * @param {string} payload.vehicleType mini_truck | tempo | container | trailer | open_body | refrigerated
   * @param {boolean} [payload.insuranceOpted]
   * @param {boolean} [payload.isBackhaulMatch]
   */
  predict: async (payload) => {
    const response = await api.post("/pricing/predict", payload);
    return response.data.prediction;
  },

  // Admin-only
  getModelStats: async () => {
    const response = await api.get("/pricing/ai/stats");
    return response.data.model;
  },

  // Admin-only
  retrainModel: async () => {
    const response = await api.post("/pricing/ai/retrain");
    return response.data.model;
  },
};

export default aiPricingService;