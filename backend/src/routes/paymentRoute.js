console.log('Razorpay keys:', process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);
import express from 'express';
import Razorpay from 'razorpay';

const router = express.Router();

// Remove the top-level Razorpay initialization

// POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
  console.log('Received payment create-order request:', req.body);
  const { amount } = req.body;
  if (!amount || amount < 100) {
    console.log('Invalid amount:', amount);
    return res.status(400).json({ error: 'Invalid amount' });
  }
  // Initialize Razorpay here, after dotenv.config() has run
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    });
    console.log('Order created:', order);
    res.json(order);
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ error: 'Order creation failed', details: err.message });
  }
});

export default router; 