import axios from 'axios';
import { useAuthStore } from './store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // change if using a different port or domain
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
