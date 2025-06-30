import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InvoiceButton from '../components/InvoiceButton';

const OrderSummary: React.FC = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Network error');
        setLoading(false);
      });
  }, [orderId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Order Confirmed! 🎉</h1>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="mb-4">
          <span className="font-semibold">Order Number:</span> <span className="text-blue-700">{order._id}</span>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Order Date:</span> {new Date(order.createdAt).toLocaleString()}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Payment Status:</span> <span className={order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}>{order.paymentStatus}</span>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Total:</span> <span className="text-lg font-bold">₹{order.total}</span>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Shipping To:</span>
          <div className="ml-2 mt-1 text-gray-700">
            <div>{order.shipping.name}</div>
            <div>{order.shipping.addressLine}, {order.shipping.city}, {order.shipping.district}</div>
            <div>{order.shipping.state} - {order.shipping.pinCode}</div>
            <div>Phone: {order.shipping.phone}</div>
            <div>Email: {order.shipping.email}</div>
            {order.shipping.notes && <div>Notes: {order.shipping.notes}</div>}
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Ordered Items</h2>
      <div className="space-y-6 mb-8">
        {order.items.map((item: any, idx: number) => (
          <div key={idx} className="flex flex-col md:flex-row items-center gap-6 bg-gray-100 rounded-xl p-4 shadow-sm">
            <div className="w-24 h-24 flex-shrink-0 bg-white rounded-lg border flex items-center justify-center overflow-hidden">
              <img
                src={item.photoUrl}
                alt="Preview"
                className="object-contain w-full h-full"
                loading="lazy"
                onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
              />
            </div>
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-semibold text-gray-900">Frame: <span className="text-blue-700">{item.frame?.name || item.frame}</span></div>
                  <div className="font-semibold text-gray-900">Size: <span className="text-blue-700">{item.size}</span></div>
                  <div className="text-sm text-gray-500">Price: ₹{item.price}</div>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <span className="text-sm text-gray-700">Qty: {item.quantity}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
          onClick={() => window.location.href = '/order-history'}
        >
          View Order History
        </button>
        <InvoiceButton orderId={order._id} />
      </div>
    </div>
  );
};

export default OrderSummary; 