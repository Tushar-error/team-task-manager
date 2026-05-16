import axios from 'axios';

/**
 * Axios instance pre-configured with the base URL.
 * Automatically attaches the JWT token from localStorage to every request.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ttm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ttm_user');
      localStorage.removeItem('ttm_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
