import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';

dotenv.config();

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentMethods = ['razorpay', 'cod'];
const paymentStatuses = ['pending', 'completed', 'failed'];

const createSampleOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get admin user
    const adminUser = await User.findOne({ email: 'admin@frameely.com' });
    if (!adminUser) {
      console.error('Admin user not found');
      process.exit(1);
    }

    // Create sample orders
    const sampleOrders = [];
    for (let i = 0; i < 20; i++) {
      const totalAmount = Math.floor(Math.random() * 5000) + 1000;
      const order = new Order({
        userId: adminUser._id,
        items: [
          {
            frame: '6412345678901234567890ab', // Replace with actual frame ID
            size: '8x10',
            quantity: Math.floor(Math.random() * 3) + 1,
            price: Math.floor(Math.random() * 1000) + 500
          }
        ],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        totalAmount,
        paymentId: `pay_${Math.random().toString(36).substr(2, 9)}`,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        shippingAddress: {
          name: 'Test User',
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          postalCode: '123456',
          country: 'India',
          phone: '1234567890'
        }
      });
      sampleOrders.push(order);
    }

    // Delete existing orders
    await Order.deleteMany({});
    console.log('Cleared existing orders');

    // Save new orders
    await Order.insertMany(sampleOrders);
    console.log('Created sample orders');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createSampleOrders(); 