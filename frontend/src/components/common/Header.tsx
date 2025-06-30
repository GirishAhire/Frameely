import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react';
import useCartStore from '../../context/CartContext';
import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../config/api';

// Define navigation links, excluding checkout which will be conditionally displayed
const defaultNavLinks = [
  { to: '/catalog', label: 'Catalog' },
  { to: '/upload-preview', label: 'Upload' },
];

const checkoutLink = { to: '/checkout', label: 'Checkout' };

const Header = () => {
  const location = useLocation();
  const totalItems = useCartStore((state: { totalItems: () => number }) => state.totalItems());
  const isLoggedIn = useAuthStore((state: { isLoggedIn: boolean }) => state.isLoggedIn);
  const user = useAuthStore((state: { user: any }) => state.user);
  const token = useAuthStore((state: { token: string | null }) => state.token);
  const logout = useAuthStore((state: { logout: () => void }) => state.logout);
  const updateUserData = useAuthStore((state: { updateUserData: (data: any) => void }) => state.updateUserData);
  const [userName, setUserName] = useState<string>('');

  // Only show checkout link if cart has items
  const navLinks = [...defaultNavLinks];
  if (totalItems > 0) {
    navLinks.push(checkoutLink);
  }

  // Fetch fresh user data from backend on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn || !token) return;
      
      try {
        const response = await api.get('/api/auth/check', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.valid && response.data.user) {
          // Update the global user store with fresh data
          updateUserData(response.data.user);
          console.log('Updated user data from API:', response.data.user);
        }
      } catch (err) {
        console.error('Failed to fetch user data in header:', err);
      }
    };

    fetchUserData();
  }, [isLoggedIn, token, updateUserData]);

  // Update username whenever user data changes
  useEffect(() => {
    if (user && user.name) {
      setUserName(user.name);
    } else if (user && user.email) {
      const emailUsername = user.email.split('@')[0];
      setUserName(emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1));
    } else {
      setUserName('User');
    }
    
    console.log('User data in header component:', user);
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 shadow-md w-full sticky top-0 z-50">
      <nav className="px-8 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-3xl font-extrabold text-white tracking-tight group-hover:text-blue-400 transition-colors">Frameely</span>
            <span className="hidden sm:inline-block text-xs text-blue-300 bg-blue-900 rounded px-2 py-1 ml-2">Custom Frames</span>
          </Link>
          {/* Navigation */}
          <div className="flex items-center space-x-2 md:space-x-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                  ${location.pathname === link.to
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-200 hover:bg-blue-800 hover:text-white'}
                `}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600">
                    {userName}
                  </span>
                  <Link
                    to="/profile"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-gray-200 hover:bg-blue-800 hover:text-white`}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                  ${location.pathname === '/login'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-200 hover:bg-blue-800 hover:text-white'}
                `}
              >
                Login
              </Link>
            )}
            {/* Cart Icon */}
            <Link to="/cart" className="relative flex items-center group ml-2">
              <ShoppingCart className="w-6 h-6 text-gray-200 group-hover:text-blue-400 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 shadow">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header 