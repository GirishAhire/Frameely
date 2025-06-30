/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useCartStore from '../context/CartContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../config/api';

const schema = yup.object().shape({
  name: yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .trim(),
  email: yup.string()
    .required('Email is required')
    .email('Enter a valid email address')
    .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Only Gmail addresses are allowed')
    .trim(),
  phone: yup.string()
    .required('Phone number is required')
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .trim(),
  addressLine: yup.string()
    .required('Address line is required')
    .min(10, 'Address must be at least 10 characters')
    .max(100, 'Address must be at most 100 characters')
    .trim(),
  landmark: yup.string().max(100, 'Landmark must be at most 100 characters').default('').trim(),
  city: yup.string()
    .required('City is required')
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be at most 50 characters')
    .trim(),
  district: yup.string()
    .required('District is required')
    .min(2, 'District must be at least 2 characters')
    .max(50, 'District must be at most 50 characters')
    .trim(),
  state: yup.string()
    .required('State is required')
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must be at most 50 characters')
    .trim(),
  pinCode: yup.string()
    .required('Pin code is required')
    .matches(/^\d{6}$/, 'Enter a valid 6-digit Indian pin code')
    .trim(),
  notes: yup.string().max(200, 'Notes must be at most 200 characters').default('').trim().required(),
});

type FormData = yup.InferType<typeof schema>;

const SHIPPING_COST = 99;

// Add a list of Indian states
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Utility to load Razorpay script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const saved = localStorage.getItem('shipping');
  const defaultValues: FormData = saved ? {
    ...JSON.parse(saved),
    notes: (JSON.parse(saved).notes ?? ''),
    landmark: (JSON.parse(saved).landmark ?? ''),
  } : {
    name: '',
    email: '',
    phone: '',
    addressLine: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    notes: '',
  };

  const { register, handleSubmit, setValue, formState: { errors, isValid } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange'
  });

  // Check for any form errors and update message
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setValidationMessage("Please complete all required fields before proceeding to payment.");
    } else {
      setValidationMessage(null);
    }
  }, [errors]);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isLoggedIn, navigate]);

  // Auto-fill city and district based on pin code
  const handlePinBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const pin = e.target.value.trim();
    if (/^\d{6}$/.test(pin)) {
      setPinLoading(true);
      setPinError(null);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const post = data[0].PostOffice[0];
          setValue('city', post.Block || post.Taluk || '');
          setValue('district', post.District || '');
          setValue('state', post.State || '');
        } else {
          setPinError('Pin code not found. Please check and enter manually.');
        }
      } catch (err) {
        setPinError('Failed to fetch address info. Please enter manually.');
      } finally {
        setPinLoading(false);
      }
    }
  };

  const onSubmit = (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('shipping', JSON.stringify(data));
      setTimeout(() => {
        setLoading(false);
        // Here you would proceed to payment
        alert('Proceeding to payment...');
      }, 1200);
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const subtotal = totalPrice();
  const total = subtotal + SHIPPING_COST;

  // Razorpay payment handler
  const handlePayment = async () => {
    // Check if form is valid first
    if (Object.keys(errors).length > 0) {
      setValidationMessage("Please complete all required shipping information before proceeding to payment.");
      // Scroll to top where validation message is shown
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Highlight fields with errors
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (element as HTMLElement).focus();
      }
      return;
    }

    // First validate the form
    const isValid = await handleSubmit(async (data) => {
      setPaymentLoading(true);
      localStorage.setItem('shipping', JSON.stringify(data));
      const total = subtotal + SHIPPING_COST;
      const orderPayload = { amount: total };
      console.log('orderPayload:', orderPayload);
      try {
        // Use the configured API
        const res = await api.post('/api/payment/create-order', orderPayload);
        const order = res.data;
        
        if (!order.id) throw new Error('Order creation failed');
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Failed to load payment gateway.');
          setPaymentLoading(false);
          return;
        }
        console.log('Razorpay key:', import.meta.env.VITE_RAZORPAY_KEY);
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY,
          amount: order.amount,
          currency: order.currency,
          name: 'Frameely',
          description: 'Order Payment',
          order_id: order.id,
          handler: async function (response: any) {
            // Gather order data
            const orderData = {
              items: items.map(item => ({
                frame: item.frameId || item.id,
                size: item.size,
                price: item.price,
                photoUrl: item.photoUrl,
                quantity: item.quantity,
              })),
              shipping: data, // Use validated data from form
              paymentId: response.razorpay_payment_id,
              paymentStatus: 'paid',
              total,
            };

            // Create order in backend
            try {
              console.log('Sending order data:', JSON.stringify(orderData));
              
              // Use the configured API for the new endpoint
              const res = await api.post('/api/user/orders', orderData, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              });
              
              if (!res.data) {
                console.error('Order creation failed:', res.status, res.statusText);
                toast.error(`Order creation failed: ${res.statusText}`);
                
                // Even if order creation fails, consider the payment successful
                clearCart();
                navigate('/order-history');
                return;
              }
              
              const createdOrder = res.data;
              console.log('Order created successfully:', createdOrder);
              if (createdOrder && createdOrder._id) {
                clearCart();
                toast.success('Order placed successfully');
                navigate(`/order-history`);
              } else {
                console.error('Invalid order response:', createdOrder);
                toast.error('Order created but details not available');
                clearCart();
                navigate('/order-history');
              }
            } catch (err: any) {
              console.error('Order creation error:', err);
              toast.error(`Order creation failed: ${err.response?.data?.message || err.message || 'Unknown error'}`);
              // Still clear cart and redirect since payment was completed
              clearCart();
              navigate('/order-history');
            }
          },
          prefill: {
            name: data.name,
            email: data.email,
            contact: data.phone,
          },
          theme: { color: '#2563eb' },
          modal: {
            ondismiss: () => {
              toast.info('Payment popup closed.');
            },
          },
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err: any) {
        console.error('Payment initiation error:', err);
        toast.error(`Payment initiation failed: ${err.response?.data?.message || err.message || 'Unknown error'}`);
      } finally {
        setPaymentLoading(false);
      }
    })();
    
    // If form validation fails, handleSubmit won't call our function
    // and will highlight the errors instead
  };

  return (
    <div className="min-h-[70vh] bg-gray-50 py-12 px-2">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Checkout</h1>
        {validationMessage && <div className="text-red-500 text-sm mb-4">{validationMessage}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Info */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Contact Information</h2>
            <div>
              <label className="block font-medium mb-1">Full Name</label>
              <input {...register('name')}
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-200"
                maxLength={50}
                onBlur={e => e.target.value = e.target.value.trim()}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input {...register('email')}
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-200"
                maxLength={50}
                onBlur={e => e.target.value = e.target.value.trim()}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Phone</label>
              <input {...register('phone')}
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-200"
                maxLength={10}
                onBlur={e => e.target.value = e.target.value.trim()}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
            <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-800">Shipping Address</h2>
            <div>
              <label className="block font-medium mb-1">Address Line</label>
              <textarea {...register('addressLine')}
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-200"
                rows={2}
                maxLength={100}
                onBlur={e => e.target.value = e.target.value.trim()}
              />
              {errors.addressLine && <p className="text-red-500 text-sm mt-1">{errors.addressLine.message}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Landmark (optional)</label>
              <input {...register('landmark')}
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-200"
                maxLength={100}
                onBlur={e => e.target.value = e.target.value.trim()}
              />
              {errors.landmark && <p className="text-red-500 text-sm mt-1">{errors.landmark.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">City</label>
                <input {...register('city')}
                  className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-200"
                  maxLength={50}
                  onBlur={e => e.target.value = e.target.value.trim()}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block font-medium mb-1">District</label>
                <input {...register('district')}
                  className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-200"
                  maxLength={50}
                  onBlur={e => e.target.value = e.target.value.trim()}
                />
                {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>}
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">State</label>
              <select {...register('state')}
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Pin Code</label>
              <input {...register('pinCode')}
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-200"
                maxLength={6}
                onBlur={handlePinBlur}
              />
              {pinLoading && <p className="text-blue-500 text-xs mt-1">Looking up pin code...</p>}
              {pinError && <p className="text-red-500 text-xs mt-1">{pinError}</p>}
              {errors.pinCode && <p className="text-red-500 text-sm mt-1">{errors.pinCode.message}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Delivery Notes (optional)</label>
              <textarea {...register('notes')}
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-blue-200"
                rows={2}
                maxLength={200}
                onBlur={e => e.target.value = e.target.value.trim()}
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              <div className="space-y-4 max-h-56 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 border-b pb-2 last:border-b-0">
                    <div className="w-14 h-14 bg-white rounded border flex items-center justify-center overflow-hidden">
                      <img src={item.photoUrl} alt="Preview" className="object-contain w-full h-full" loading="lazy" onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.size}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-semibold text-gray-700">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>₹{SHIPPING_COST}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
            <Button 
              type="button" 
              onClick={handlePayment} 
              className={`w-full py-4 text-lg transition-colors ${
                Object.keys(errors).length > 0 
                  ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' 
                  : 'bg-green-600 hover:bg-green-700'
              }`} 
              disabled={paymentLoading || loading || Object.keys(errors).length > 0}
            >
              {paymentLoading 
                ? 'Processing Payment...' 
                : Object.keys(errors).length > 0 
                  ? 'Complete Required Fields' 
                  : 'Proceed to Payment'
              }
            </Button>
          </div>
          </form>
      </div>
    </div>
  );
};

export default Checkout; 