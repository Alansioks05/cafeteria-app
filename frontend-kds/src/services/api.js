import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cafeteria-backend-618b.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Inyecta el token en cada petición si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cafeteria_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;