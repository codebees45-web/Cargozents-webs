import api from './api';

export const reviewShipmentDriver = (shipmentId, rating, comment) =>
  api.post(`/reviews/shipment/${shipmentId}`, { rating, comment });

export const reviewOrderShipper = (orderId, rating, comment) =>
  api.post(`/reviews/order/${orderId}`, { rating, comment });

export const getReviewsForUser = (userId) => api.get(`/reviews/user/${userId}`);