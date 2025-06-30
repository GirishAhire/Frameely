import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../config/api';
import { toast } from 'sonner';
// @ts-ignore
import { jsPDF } from "jspdf";
// @ts-ignore
import autoTable from 'jspdf-autotable';

interface OrderItem {
  frame: string;
  size: string;
  quantity: number;
  price: number;
  _id: string;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
}

interface UserDetails {
  name: string;
  email: string;
  phone?: string;
}

interface Order {
  _id: string;
  userId: string;
  userDetails: UserDetails;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  paymentMethod: string;
  paymentId: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/api/user/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('Order details:', response.data);
        setOrder(response.data);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.response?.data?.message || 'Failed to fetch order details');
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const generateInvoice = () => {
    if (!order) return;

    const doc = new jsPDF();
    
    // Add company logo/header
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 139);
    doc.text('Frameely', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Invoice', 105, 30, { align: 'center' });
    
    // Add order info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Order #: ${order._id}`, 15, 40);
    doc.text(`Date: ${format(new Date(order.createdAt), 'dd MMM yyyy')}`, 15, 45);
    doc.text(`Payment Method: ${order.paymentMethod}`, 15, 50);
    doc.text(`Payment ID: ${order.paymentId || 'N/A'}`, 15, 55);
    
    // Add customer info
    doc.text('Shipping Address:', 120, 40);
    const address = `${order.shippingAddress.street}, ${order.shippingAddress.city}`.split(',');
    let yPos = 45;
    address.forEach(line => {
      doc.text(line.trim(), 120, yPos);
      yPos += 5;
    });
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`, 120, yPos);
    yPos += 5;
    doc.text(order.shippingAddress.country, 120, yPos);
    
    // Add items table
    const tableColumn = ["Item", "Size", "Price", "Qty", "Total"];
    const tableRows: any[] = [];
    
    order.items.forEach(item => {
      const itemData = [
        item.frame,
        item.size,
        `₹${item.price}`,
        item.quantity,
        `₹${item.price * item.quantity}`
      ];
      tableRows.push(itemData);
    });
    
    // Use autoTable directly instead of doc.autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 139] }
    });
    
    // Add total
    // @ts-ignore - jspdf-autotable types
    const finalY = doc.lastAutoTable.finalY || 120;
    
    doc.text(`Total: ₹${order.totalAmount}`, 150, finalY + 10, { align: 'right' });
    
    // Add footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for shopping with Frameely!', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`frameely-invoice-${order._id}.pdf`);
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => navigate('/order-history')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );

  if (!order) return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <h2 className="text-xl font-semibold">Order not found</h2>
      <button 
        onClick={() => navigate('/order-history')}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Orders
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Details</h1>
        <div className="flex gap-2">
          <button 
            onClick={generateInvoice}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            Download Invoice
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Order Header */}
        <div className="bg-gray-50 p-6 border-b">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order #{order._id}</h2>
              <p className="text-gray-600">Placed on {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'}`
              }>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Shipping Info */}
            <div>
              <h3 className="text-gray-900 font-medium mb-2">Shipping Information</h3>
              <address className="not-italic text-gray-600">
                {order.shippingAddress.name}<br />
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </address>
              <p className="mt-2 text-gray-600">Phone: {order.shippingAddress.phone}</p>
              {order.shippingAddress.email && <p className="text-gray-600">Email: {order.shippingAddress.email}</p>}
            </div>

            {/* Payment Info */}
            <div>
              <h3 className="text-gray-900 font-medium mb-2">Payment Information</h3>
              <p className="text-gray-600">Method: {order.paymentMethod}</p>
              <p className={`font-medium ${order.paymentStatus === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                {order.paymentStatus === 'completed' ? 'Paid' : 'Not Paid'}
              </p>
              {order.paymentId && (
                <p className="text-gray-600 text-sm mt-1">Transaction ID: {order.paymentId}</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-8">
            <h3 className="text-gray-900 font-medium mb-4">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.frame}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-gray-900 font-medium mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button 
          onClick={() => navigate('/order-history')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default OrderDetail; 