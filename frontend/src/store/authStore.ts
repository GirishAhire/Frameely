import { create } from 'zustand';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface User {
  name?: string;
  email?: string;
  id?: string;
  isAdmin?: boolean;
}

// Define custom JWT payload type
interface JwtCustomPayload {
  userId?: string;
  _id?: string;
  sub?: string;
  name?: string;
  username?: string;
  email?: string;
  isAdmin?: boolean;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUserData: (userData: User) => void;
}

// Initialize auth state from localStorage
const getInitialState = () => {
  const token = localStorage.getItem('token');
  if (!token) return { token: null, user: null, isLoggedIn: false };
  
  try {
    const decoded = jwtDecode<JwtCustomPayload>(token);
    // Extract user data from token
    const userData = {
      name: decoded.name || decoded.username || decoded.email?.split('@')[0] || 'User',
      email: decoded.email || '',
      id: decoded._id || decoded.userId || decoded.sub || '',
      isAdmin: decoded.isAdmin || false
    };
    return { token, user: userData, isLoggedIn: true };
  } catch (error) {
    console.error('Failed to decode token:', error);
    localStorage.removeItem('token');
    return { token: null, user: null, isLoggedIn: false };
  }
};

const useAuthStore = create<AuthState>((set, get) => ({
  ...getInitialState(),

  login: (token: string) => {
    try {
      localStorage.setItem('token', token);
      const decoded = jwtDecode<JwtCustomPayload>(token);
      // Extract user data from token
      const userData = {
        name: decoded.name || decoded.username || decoded.email?.split('@')[0] || 'User',
        email: decoded.email || '',
        id: decoded._id || decoded.userId || decoded.sub || '',
        isAdmin: decoded.isAdmin || false
      };
      console.log('Decoded token:', decoded);
      console.log('User data:', userData);
      set({ token, user: userData, isLoggedIn: true });
    } catch (error) {
      console.error('Login error:', error);
      set({ token: null, user: null, isLoggedIn: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isLoggedIn: false });
  },

  updateUserData: (userData: User) => {
    set(state => ({
      user: { ...state.user, ...userData }
    }));
  },

  refreshToken: async () => {
    try {
      const currentToken = get().token;
      if (!currentToken) return;

      const res = await axios.post('/api/auth/refresh', null, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });

      if (res.data.token) {
        const newToken = res.data.token;
        localStorage.setItem('token', newToken);
        const decoded = jwtDecode<JwtCustomPayload>(newToken);
        
        // Extract user data from refreshed token
        const userData = {
          name: decoded.name || decoded.username || decoded.email?.split('@')[0] || 'User',
          email: decoded.email || '',
          id: decoded._id || decoded.userId || decoded.sub || '',
          isAdmin: decoded.isAdmin || false
        };
        
        set({ token: newToken, user: userData, isLoggedIn: true });
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      get().logout();
    }
  }
}));

// Setup axios interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useAuthStore.getState().refreshToken();
        const newToken = useAuthStore.getState().token;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        useAuthStore.getState().logout();
      }
    }
    
    return Promise.reject(error);
  }
);

export default useAuthStore;
