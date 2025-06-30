import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axios from 'axios';

const Profile: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState('');

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch user profile data from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoggedIn || !token) return;
      
      try {
        setLoading(true);
        const response = await axios.get('/api/auth/check', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.valid && response.data.user) {
          setProfileData(response.data.user);
        } else {
          setError('Could not fetch profile data');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Error loading profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    // Log current user data from store for debugging
    console.log('User data in profile component:', user);
  }, [isLoggedIn, token, user]);

  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-96 max-w-full border border-blue-100">
          <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700 drop-shadow">My Profile</h2>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get the most accurate user data available
  const displayUser = profileData || user || {};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 max-w-full border border-blue-100">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700 drop-shadow">My Profile</h2>
        {error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="block text-gray-600 text-sm font-medium">Name</span>
              <span className="block text-lg font-semibold text-gray-900 mt-1">
                {displayUser.name || 'Not set'}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="block text-gray-600 text-sm font-medium">Email</span>
              <span className="block text-lg font-semibold text-gray-900 mt-1">
                {displayUser.email || 'Not available'}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="block text-gray-600 text-sm font-medium">User ID</span>
              <span className="block text-sm font-mono text-gray-500 mt-1 break-words">
                {displayUser.id || displayUser._id || 'Not available'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 