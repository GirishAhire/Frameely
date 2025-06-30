import express from 'express';
import Order from '../models/Order.js';
import { authenticateUser } from '../middleware/auth.js';
import invoiceRoute from './invoiceRoute.js';
import User from '../models/User.js';

const router = express.Router();

// POST /api/orders
router.post('/', authenticateUser, async (req, res) => {
  try {
    console.log('Creating new order:', req.body);
    // Get the full user data to ensure we have access to name and email
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format shipping address to match expected schema and ensure name from user profile
    const shippingAddress = {
      name: req.body.shipping?.name || user.name || 'Unknown',
      street: req.body.shipping?.addressLine || '',
      city: req.body.shipping?.city || '',
      state: req.body.shipping?.state || '',
      postalCode: req.body.shipping?.pinCode || '',
      country: 'India',
      phone: req.body.shipping?.phone || '',
      email: user.email || req.body.shipping?.email || '', // Add email to shipping address
    };

    // Create the order with proper userId field and shipping format
    const order = new Order({
      userId: req.user._id, // Use userId instead of user
      userDetails: { // Add extra user details for redundancy
        name: user.name,
        email: user.email,
        phone: req.body.shipping?.phone || ''
      },
      items: req.body.items.map(item => ({
        frame: item.frame,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress,
      totalAmount: req.body.total,
      paymentMethod: req.body.paymentMethod || 'razorpay',
      paymentId: req.body.paymentId || 'pay_' + Math.random().toString(36).substring(2, 11),
      paymentStatus: req.body.paymentStatus || 'pending',
      status: 'pending'
    });

    await order.save();
    console.log('Order created successfully:', order._id);
    res.status(201).json(order);
  } catch (err) {
    console.error('Failed to create order:', err);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// GET /api/orders/:orderId
router.get('/:orderId', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.frame')
      .populate('userId', 'name email'); // Change to userId to match model
    
    if (!order || (!order.userId?._id.equals(req.user._id) && !req.user.isAdmin)) {
      return res.status(404).json({ error: 'Order not found or access denied' });
    }
    res.json(order);
  } catch (err) {
    console.error('Failed to get order:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders (user's orders)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }) // Change to userId to match model
      .sort({ createdAt: -1 })
      .populate('items.frame', 'name') // Populate frame data to get names
      .populate('userId', 'name email'); // Populate user data
    
    res.json(orders);
  } catch (err) {
    console.error('Failed to get orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register invoice route
router.use('/invoices', invoiceRoute);

export default router; 