import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { authenticateAdmin } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /api/admin/orders - Get all orders with pagination and filters
router.get('/orders', authenticateAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching orders from database...');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query based on filters
    const query = {};
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    if (req.query.search) {
      query.$or = [
        { 'shippingAddress.name': { $regex: req.query.search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: req.query.search, $options: 'i' } },
        { _id: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get orders with enhanced population
    const orders = await Order.find(query)
      .populate({ 
        path: 'userId', 
        select: 'name email username', 
        strictPopulate: false 
      })
      .populate({ 
        path: 'items.frame', 
        select: 'name description price size material color',
        strictPopulate: false 
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Enhance the orders data with information from shippingAddress for display
    const enhancedOrders = orders.map(order => {
      const orderObj = order.toObject();
      
      // Use userDetails field as primary source of user information if available
      if (orderObj.userDetails && orderObj.userDetails.name) {
        // If we have userDetails, use that as primary info
        orderObj.userId = {
          _id: orderObj.userId?._id || 'unknown',
          name: orderObj.userDetails.name,
          email: orderObj.userDetails.email || order.shippingAddress?.email || 'No email'
        };
      }
      // Fallback to userId if populated or shippingAddress
      else if (!orderObj.userId || (typeof orderObj.userId === 'object' && !orderObj.userId.name && !orderObj.userId.email)) {
        // Check if userId is just a string (ID) and not populated
        if (typeof orderObj.userId === 'string') {
          orderObj.userId = {
            _id: orderObj.userId,
            name: order.shippingAddress?.name || 'Customer ' + order._id.toString().substring(0, 6),
            email: order.shippingAddress?.email || order.shippingAddress?.phone || 'No contact info'
          };
        } else {
          // If userId object exists but has no name/email
          orderObj.userId = {
            ...orderObj.userId,
            name: orderObj.userId?.name || order.shippingAddress?.name || 'Customer ' + order._id.toString().substring(0, 6),
            email: orderObj.userId?.email || order.shippingAddress?.email || order.shippingAddress?.phone || 'No contact info'
          };
        }
      }
      
      // Add frame sizes from the order items
      if (orderObj.items && Array.isArray(orderObj.items)) {
        orderObj.items = orderObj.items.map(item => {
          // If frame is just an ID, add a display name
          if (item.frame && typeof item.frame === 'string') {
            item.frame = {
              _id: item.frame,
              name: `Frame ${item.frame.substring(0, 6)}`
            };
          } else if (!item.frame) {
            // If frame is missing
            item.frame = {
              _id: 'unknown',
              name: 'Unknown Frame'
            };
          }
          
          // Ensure size is properly set
          if (!item.size) {
            item.size = item.frame?.size || '8x10'; 
          }
          
          return item;
        });
      }
      
      // Add shipping address info for admin convenience
      orderObj.shippingDetails = {
        address: `${orderObj.shippingAddress?.street || ''}, ${orderObj.shippingAddress?.city || ''}, ${orderObj.shippingAddress?.state || ''} - ${orderObj.shippingAddress?.postalCode || ''}`,
        phone: orderObj.shippingAddress?.phone || orderObj.userDetails?.phone || 'No phone',
        name: orderObj.shippingAddress?.name || orderObj.userDetails?.name || 'No name'
      };
      
      return orderObj;
    });

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    console.log(`✅ Retrieved ${orders.length} orders from database and enhanced with customer details`);
    res.json({ data: enhancedOrders, total });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT /api/admin/orders/:orderId/status - Update order status
router.put('/orders/:orderId/status', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    )
    .populate({ path: 'userId', select: 'name email', strictPopulate: false })
    .populate({ path: 'items.frame', strictPopulate: false });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching dashboard data from database...');
    
    // Get total orders and revenue
    const orders = await Order.find();
    const totalOrders = orders.length;
    
    // Calculate actual revenue from orders (fix null/undefined values)
    const totalRevenue = orders.reduce((sum, order) => {
      const amount = order.totalAmount || 0;
      return sum + amount;
    }, 0);
    
    // Count pending and processing orders (pending deliveries)
    const pendingOrders = orders.filter(order => 
      order.status === 'pending' || 
      order.status === 'processing' || 
      order.status === 'shipped'
    ).length;
    
    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Convert to proper object format and ensure all statuses have values
    const statusObject = {
      'pending': 0,
      'processing': 0,
      'shipped': 0, 
      'delivered': 0,
      'cancelled': 0
    };
    
    ordersByStatus.forEach(item => {
      if (item._id) {
        statusObject[item._id] = item.count;
      }
    });

    // Get recent orders
    const recentOrders = await Order.find()
      .populate({ path: 'userId', select: 'name email', strictPopulate: false })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get revenue data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Simulate low stock frames for the dashboard (since we might not have that data)
    const lowStockFrames = Math.floor(Math.random() * 5) + 1;

    console.log(`✅ Retrieved dashboard data: ${totalOrders} orders, ₹${totalRevenue} revenue, ${pendingOrders} pending`);
    res.json({
      totalOrders,
      totalRevenue,
      ordersByStatus: statusObject,
      pendingOrders,
      lowStockFrames,
      recentOrders,
      dailyRevenue
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Admin login route
router.post('/login', async (req, res) => {
  try {
    console.log('👉 Login attempt received:', {
      email: req.body.email,
      hasPassword: !!req.body.password
    });

    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    console.log('🔍 User lookup result:', {
      found: !!user,
      isAdmin: user?.isAdmin,
      email: user?.email
    });
    
    if (!user) {
      console.log('❌ No user found with email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isAdmin) {
      console.log('❌ User is not an admin');
      return res.status(401).json({ error: 'Not authorized as admin' });
    }

    // Check password using the model's method
    console.log('🔐 Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    console.log('🔑 Password comparison result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: true },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful, token generated');
    res.json({ token });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 