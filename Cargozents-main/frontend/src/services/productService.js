import api from './api';

export const getMyProducts = () => api.get('/products/mine');
export const createProduct = (payload) => api.post('/products', payload);
export const updateProduct = (id, payload) => api.patch(`/products/${id}`, payload);
export const deleteProduct = (id) => api.delete(`/products/${id}`);