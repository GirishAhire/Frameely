import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to order-management
    navigate('/admin/order-management', { replace: true });
  }, [navigate]);

  return null;
} 