import axios from 'axios';
import { isPublicAuthRequest } from './utils/apiErrors';

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// N'envoie pas le token sur les routes publiques (évite les 401 intempestifs)
api.interceptors.request.use((config) => {
  if (!isPublicAuthRequest(config.url || '')) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Redirection login uniquement si session expirée sur une route protégée
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const onAuthPage = AUTH_PAGES.includes(window.location.pathname);

    if (status === 401 && !isPublicAuthRequest(requestUrl)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!onAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
