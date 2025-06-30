import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FrameForm from './FrameForm';

export default function AdminPanel() {
  const navigate = useNavigate();

  // TODO: Replace with actual JWT authentication
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Frame Management</h1>
        <button
          onClick={() => navigate('/catalog')}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Catalog
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <FrameForm />
      </div>
    </div>
  );
} 