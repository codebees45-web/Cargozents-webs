import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every outgoing request if the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('loadshare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling: token expired/invalid -> force logout.
// Skip auth routes (login, register, etc.) so they can handle their own errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('loadshare_token');
      localStorage.removeItem('loadshare_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;