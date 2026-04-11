const express = require('express');
const router = express.Router();
const validator = require('validator');
const Order = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');
const userAuth = require('../middleware/userAuth');
const { sendOrderNotification } = require('../utils/mailer');

/**
 * POST /api/orders
 * Public — Submit a project order
 */
router.post('/', async (req, res) => {
  try {
    const { services, projectName, description, budget, timeline,
      clientName, clientEmail, clientPhone, extraNotes } = req.body;

    if (!services || !Array.isArray(services) || services.length === 0)
      return res.status(400).json({ success: false, message: 'At least one service is required.' });
    if (!projectName?.trim())
      return res.status(400).json({ success: false, message: 'Project name is required.' });
    if (!description?.trim())
      return res.status(400).json({ success: false, message: 'Project description is required.' });
    if (!clientName?.trim())
      return res.status(400).json({ success: false, message: 'Your name is required.' });
    if (!clientEmail || !validator.isEmail(clientEmail))
      return res.status(400).json({ success: false, message: 'A valid email is required.' });

    const orderData = {
      services: services.map(s => validator.escape(s.trim())),
      projectName: validator.escape(projectName.trim()),
      description: description.trim(),
      budget: budget ? validator.escape(budget.trim()) : 'Not specified',
      timeline: timeline ? validator.escape(timeline.trim()) : 'Not specified',
      clientName: validator.escape(clientName.trim()),
      clientEmail: validator.normalizeEmail(clientEmail.trim()),
      clientPhone: clientPhone ? validator.escape(clientPhone.trim()) : '',
      extraNotes: extraNotes ? extraNotes.trim() : '',
      ipAddress: req.ip || req.connection.remoteAddress,
      // Link to user account if logged in
      userId: req.user?.id || null,
    };

    const order = await Order.create(orderData);

    sendOrderNotification(orderData).catch(err => {
      console.error('Email notification error:', err.message);
    });

    console.log(`✅ New order: "${orderData.projectName}" from ${orderData.clientName}`);

    res.status(201).json({
      success: true,
      message: "Order submitted! We'll review and contact you shortly.",
      data: { id: order._id },
    });
  } catch (error) {
    console.error('❌ Order error:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

/**
 * GET /api/orders/mine
 * User — Get their own orders (by email)
 */
router.get('/mine', userAuth, async (req, res) => {
  try {
    const user = req.user;
    // Match orders by userId OR by email if older orders
    const orders = await Order.find({
      $or: [
        { userId: user.id },
        { clientEmail: user.email }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('❌ Fetch user orders error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * GET /api/orders
 * Admin — List all orders
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) {
      const validStatuses = ['new', 'in-progress', 'completed', 'rejected'];
      if (validStatuses.includes(req.query.status)) filter.status = req.query.status;
    }
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Admin — Update order status
 */
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'in-progress', 'completed', 'rejected'];
    if (!status || !validStatuses.includes(status))
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    res.json({ success: true, message: `Status updated to "${status}".`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
