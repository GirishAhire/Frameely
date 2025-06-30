import express from 'express';
import { getOrders, updateOrderStatus, createOrder, getUserOrders, getUserOrderById } from '../controllers/orderController.js';
import { authenticateUser, authenticateAdmin } from '../src/middleware/auth.js';

const router = express.Router();

// User routes
router.route('/user/orders')
  .post(authenticateUser, createOrder)
  .get(authenticateUser, getUserOrders);

router.route('/user/orders/:id')
  .get(authenticateUser, getUserOrderById);

// Admin routes
router.route('/')
  .get(authenticateUser, authenticateAdmin, getOrders);

router.route('/:id/status')
  .put(authenticateUser, authenticateAdmin, updateOrderStatus);

export default router; 