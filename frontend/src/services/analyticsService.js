import api from "./api";

export const getShipmentAnalytics = (params) =>
  api.get("/shipment-analytics", { params });

export const getShipmentAnalyticsSummary = () =>
  api.get("/shipment-analytics/summary");