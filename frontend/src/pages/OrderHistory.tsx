import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../config/api';
// import { OrderListSkeleton } from '../components/OrderListSkeleton'; // Uncomment if you have this component

function getToken() {
  return localStorage.getItem('token'); // Replace with your auth logic
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'delivered' ? 'bg-green-100 text-green-700' :
    status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
    status === 'shipped' ? 'bg-blue-100 text-blue-700' :
    status === 'cancelled' ? 'bg-red-100 text-red-700' :
    'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get('/api/user/orders', {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then(res => {
        console.log('Orders loaded:', res.data);
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Network error');
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="p-8 text-center">
      {/* <OrderListSkeleton /> */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!orders.length) return (
    <div className="p-8 text-center text-gray-500">
      <div className="text-2xl mb-2">No orders yet</div>
      <div className="text-sm">You haven't placed any orders yet.</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order._id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="font-semibold">Order #: <span className="text-blue-700">{order._id}</span></div>
              <div className="text-gray-600 text-sm">{format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}</div>
              <div className="text-gray-700 mt-1">Total: <span className="font-bold">₹{order.totalAmount}</span></div>
              <div className="text-sm mt-1"><StatusBadge status={order.status} /></div>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
              onClick={() => navigate(`/order/${order._id}`)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory; 