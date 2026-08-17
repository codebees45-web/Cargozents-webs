import api from "./api";

const paymentService = {

  createPayment: async (orderId) => {

    const response =
      await api.post(
        `/payments/${orderId}/create`
      );

    return response.data;

  },

  verifyPayment: async (payload) => {

    const response =
      await api.post(
        "/payments/verify",
        payload
      );

    return response.data;

  },

};

export default paymentService;