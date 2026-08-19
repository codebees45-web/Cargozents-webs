// Uses the shared axios instance (services/api.js) so requests go to the
// real backend (VITE_API_URL, e.g. http://localhost:5000/api) instead of a
// relative path that resolves against the Vite dev server and returns
// index.html (causing "Unexpected token '<' ... is not valid JSON").
import api from './api';

function authConfig(token) {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

export async function createComplaint(payload, token) {
  const { data } = await api.post('/complaints', payload, authConfig(token));
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function getMyComplaints(token) {
  const { data } = await api.get('/complaints/my', authConfig(token));
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function getAllComplaints(token) {
  const { data } = await api.get('/complaints', authConfig(token));
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function updateComplaint(id, patch, token) {
  const { data } = await api.put(`/complaints/${id}`, patch, authConfig(token));
  if (!data.success) throw new Error(data.message);
  return data.data;
}