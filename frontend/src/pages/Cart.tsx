import React from 'react';
import useCartStore from '../context/CartContext';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] bg-gray-50 py-12 px-2">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Your Cart</h1>
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
            <Button onClick={() => navigate('/catalog')} className="bg-blue-600 text-white px-6 py-2 rounded-full">Browse Frames</Button>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {items.map(item => (
                <div key={item.id} className="flex flex-col md:flex-row items-center gap-6 bg-gray-100 rounded-xl p-4 shadow-sm">
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
                        <div className="font-semibold text-gray-900">Size: <span className="text-blue-700">{item.size}</span></div>
                        <div className="text-sm text-gray-500">Price: ₹{item.price}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <span className="text-sm text-gray-700">Qty:</span>
                        <select
                          value={item.quantity}
                          onChange={e => updateQuantity(item.id, Number(e.target.value))}
                          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                          {[1,2,3,4,5].map(q => (
                            <option key={q} value={q}>{q}</option>
                          ))}
                        </select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="ml-2"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-6">
              <div className="text-lg font-semibold text-gray-900">Total: <span className="text-blue-700">₹{totalPrice()}</span></div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
                <Button className="bg-blue-600 text-white px-6 py-2 rounded-full" onClick={() => navigate('/checkout')}>Proceed to Checkout</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart; 