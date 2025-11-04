// src/services/app.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const productAPI = {
  createProduct: (data) => api.post('/products', data),
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getQRCode: (id) => api.get(`/products/${id}/qrcode`),
  
  // ĐÃ SỬA: Gửi toàn bộ data trong body
  verifyProduct: (data) => api.post('/products/verify', data),
  getProductByHash: (hash) => api.get(`/products/hash/${hash}`),
  // Aliases
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  verify: (data) => api.post('/products/verify', data), // giữ alias
};

export const statsAPI = {
  getStats: () => api.get('/stats'),
};

export default api;