import api from "./api";

const driverAssignmentService = {
  assignDriver: async (orderId) => {
    const response = await api.post(
      `/driver-assignment/${orderId}`
    );

    return response.data;
  },
};

export default driverAssignmentService;