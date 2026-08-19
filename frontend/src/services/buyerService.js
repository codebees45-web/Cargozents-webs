import api from "./api";

const buyerService = {
  // Create a new shipment
  createShipment: async (shipmentData) => {
    const response = await api.post("/buyer/shipments", shipmentData);
    return response.data;
  },

  // Get all buyer orders
  getMyOrders: async () => {
    const response = await api.get("/buyer/orders");
    return response.data;
  },

  // Get single order
  getOrderById: async (orderId) => {
    const response = await api.get(`/buyer/orders/${orderId}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await api.patch(`/buyer/orders/${orderId}/cancel`);
    return response.data;
  },

  // Get shipment estimate
  getShipmentEstimate: async (payload) => {
    const response = await api.post("/buyer/estimate", payload);
    return response.data;
  },

  // Track shipment
  trackShipment: async (orderId) => {
    const response = await api.get(`/buyer/orders/${orderId}/tracking`);
    return response.data;
  },

  // Payment History
  getPaymentHistory: async () => {
    const response = await api.get("/buyer/payments");
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await api.get("/buyer/notifications");
    return response.data;
  },
};

export default buyerService;