import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cargozents_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle expired token or role mismatch
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes("/auth/");
    const isRoleMismatch = error.response?.status === 403 && error.response?.data?.message?.includes('is not permitted to access');

    if ((error.response?.status === 401 || isRoleMismatch) && !isAuthRoute) {
      localStorage.removeItem("cargozents_token");
      localStorage.removeItem("cargozents_user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;