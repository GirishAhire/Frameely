import axios from 'axios';

// Backend API URL configuration
export const API_BASE_URL = 'http://localhost:5000';

// Create a reusable axios instance with the correct backend URL
const api = axios.create({
  baseURL: API_BASE_URL
});

export default api; 