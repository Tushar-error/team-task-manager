import axios from 'axios';

/**
 * Axios instance pre-configured with the base URL.
 * Automatically attaches the JWT token from localStorage to every request.
 */
let rawBaseURL = import.meta.env.VITE_API_URL || '';

// Normalize baseURL:
// 1. If empty (local development with proxy), use '/api/'
// 2. Otherwise, ensure it doesn't have a trailing slash, then append '/api/'
const baseURL = !rawBaseURL 
  ? '/api/' 
  : rawBaseURL.replace(/\/+$/, '') + '/api/';

const api = axios.create({
  baseURL,
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
