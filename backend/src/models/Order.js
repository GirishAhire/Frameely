import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  frame: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Frame',
    required: true
  },
  size: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const shippingAddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  street: {
    type: String,
    required: false
  },
  city: {
    type: String,
    required: false
  },
  state: {
    type: String,
    required: false
  },
  postalCode: {
    type: String,
    required: false
  },
  country: {
    type: String,
    required: false,
    default: 'India'
  },
  phone: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  }
});

// Add user details schema for redundancy
const userDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userDetails: userDetailsSchema, // Add user details for redundancy
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['razorpay', 'cod']
  },
  paymentId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema); 