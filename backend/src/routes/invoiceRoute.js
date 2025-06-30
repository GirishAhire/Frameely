import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import Order from '../models/Order.js';
import generateInvoice from '../utils/pdfGenerator.js';

const router = express.Router();

// Get invoice for an order
router.get('/:orderId', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.frame')
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if the user is authorized to view this invoice
    if (order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate PDF
    const doc = generateInvoice(order);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

    // Stream the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

export default router; 