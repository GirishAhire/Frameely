import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import axios from 'axios';
import useAuthStore from './store/authStore';
// import ErrorBoundary from './components/ErrorBoundary'; // Remove since module not found

const App = () => {
  const setLoggedIn = useAuthStore((state: { login: (token: string) => void }) => state.login);
  const logout = useAuthStore((state: { logout: () => void }) => state.logout);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        return;
      }
      
      try {
        // First, use the token directly since it has the data we need
        setLoggedIn(token);
        
        // Also verify with backend
        const res = await axios.get('/api/auth/check', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.data.valid) {
          console.error('Token validation failed on server');
          logout();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      }
    };

    checkAuth();
  }, [setLoggedIn, logout]);

  useEffect(() => {
    const syncLogout = (e: StorageEvent) => {
      if (e.key === 'token' && e.oldValue && !e.newValue) {
        logout();
      }
    };
    
    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, [logout]);

  const handleLogout = async () => {
    await axios.post('/api/auth/logout'); // optional, if you want to clear cookies
    useAuthStore.getState().logout();
  };

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;