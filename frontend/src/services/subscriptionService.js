import api from './api';

export async function getPlans() {
  const res = await api.get('/subscriptions/plans');
  return res.data.plans;
}

export async function getMySubscription() {
  const res = await api.get('/subscriptions/me');
  return res.data.subscription;
}

export async function createOrder(plan) {
  const res = await api.post('/subscriptions/create-order', { plan });
  return res.data; // { order, plan, keyId }
}

export async function verifyPayment(payload) {
  const res = await api.post('/subscriptions/verify', payload);
  return res.data.subscription;
}

export async function cancelSubscription() {
  const res = await api.post('/subscriptions/cancel');
  return res.data.subscription;
}