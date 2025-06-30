import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Frame from '../src/models/Frame.js';

dotenv.config();

const cleanupOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get a user to associate with the test order
    const user = await User.findOne({});
    if (!user) {
      console.error('No users found in the database');
      process.exit(1);
    }
    console.log(`Found user: ${user.name} (${user._id})`);

    // Get a frame to associate with the test order
    const frame = await Frame.findOne({});
    if (!frame) {
      console.error('No frames found in the database');
      process.exit(1);
    }
    console.log(`Found frame: ${frame.name} (${frame._id})`);

    // Delete existing orders
    const deleteResult = await Order.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing orders`);

    // Create a properly formatted test order
    const testOrder = new Order({
      userId: user._id,
      userDetails: {
        name: user.name || 'Test User',
        email: user.email || 'test@example.com',
        phone: '1234567890'
      },
      items: [
        {
          frame: frame._id,
          size: '8x10',
          quantity: 1,
          price: 999
        },
        {
          frame: frame._id,
          size: '12x18',
          quantity: 2,
          price: 1499
        }
      ],
      shippingAddress: {
        name: user.name || 'Test User',
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
        country: 'India',
        phone: '1234567890',
        email: user.email || 'test@example.com'
      },
      totalAmount: 3997,
      paymentMethod: 'razorpay',
      paymentId: 'pay_test' + Date.now(),
      paymentStatus: 'completed',
      status: 'processing'
    });

    await testOrder.save();
    console.log('Created test order with ID:', testOrder._id);

    // Create a second order with different status for testing
    const testOrder2 = new Order({
      userId: user._id,
      userDetails: {
        name: user.name || 'Test User',
        email: user.email || 'test@example.com',
        phone: '9876543210'
      },
      items: [
        {
          frame: frame._id,
          size: '16x24',
          quantity: 1,
          price: 2499
        }
      ],
      shippingAddress: {
        name: user.name || 'Test User',
        street: '456 Example Avenue',
        city: 'Example City',
        state: 'Example State',
        postalCode: '654321',
        country: 'India',
        phone: '9876543210',
        email: user.email || 'test@example.com'
      },
      totalAmount: 2499,
      paymentMethod: 'cod',
      paymentId: 'cod_test' + Date.now(),
      paymentStatus: 'pending',
      status: 'pending'
    });

    await testOrder2.save();
    console.log('Created second test order with ID:', testOrder2._id);

    console.log('Order cleanup and test creation complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanupOrders(); 