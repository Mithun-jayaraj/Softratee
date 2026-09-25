import axios from 'axios';
let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Ensure the API URL correctly points to the /api suffix if the user deployed without it
if (API_URL && !API_URL.endsWith('/api')) {
  // Remove trailing slash if it exists, then append /api
  API_URL = API_URL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: API_URL,
});
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default api;
