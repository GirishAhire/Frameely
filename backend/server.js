// backend/server.mjs
"use strict";
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import 'dotenv/config'; // Load environment variables FIRST
import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import orderRoutes from './routes/orderRoutes.js';
// Routes
import frameRoutes from './src/routes/frameRoute.js';
import paymentRoute from './src/routes/paymentRoute.js';
import orderRoute from './src/routes/orderRoute.js';
import invoiceRoute from './src/routes/invoiceRoute.js';
import authRoute from './src/routes/authRoute.js';
import adminRoute from './src/routes/adminRoute.js';

// Debug environment variables IMMEDIATELY
console.log('DEBUG: .env exists:', fs.existsSync('./.env'));
console.log('DEBUG: RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('DEBUG: RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET);
console.log('[DEBUG] MONGO_URI:', process.env.MONGO_URI ? '***' : 'undefined');
console.log('[DEBUG] CWD:', process.cwd());

// Configure __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins during development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/frames', frameRoutes);
app.use('/api/payment', paymentRoute);
app.use('/api', orderRoutes);
app.use('/api/orders', orderRoute);
app.use('/api/invoices', invoiceRoute);
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);

// Health check
app.get('/ping', (req, res) => res.status(200).json({ message: 'Server healthy' }));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Database connection
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down...');
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();