import api from './api';

export const registerUser = (payload) => api.post('/auth/register', payload);
export const loginUser = (payload) => api.post('/auth/login', payload);
export const verifyOtp = (payload) => api.post('/auth/verify-otp', payload);
export const resendOtp = (payload) => api.post('/auth/resend-otp', payload);
export const forgotPassword = (payload) => api.post('/auth/forgot-password', payload);
export const resetPassword = (payload) => api.post('/auth/reset-password', payload);
export const completeProfile = (payload) => api.patch('/auth/complete-profile', payload);

// Profile functions
export const updateProfile = (userId, payload) => {
  return api.patch(`/auth/update-profile/${userId}`, payload);
};

export const getProfile = (userId) => {
  return api.get(`/auth/${userId}`);
};