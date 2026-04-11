const express   = require('express');
const router    = express.Router();
const validator = require('validator');
const Order     = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');
const userAuth  = require('../middleware/userAuth');
const { sendOrderNotification } = require('../utils/mailer');

// POST /api/orders — public
router.post('/', async (req, res) => {
  try {
    const { services, projectName, description, budget, timeline, clientName, clientEmail, clientPhone, extraNotes } = req.body;

    if (!services?.length)       return res.status(400).json({ success:false, message:'At least one service required.' });
    if (!projectName?.trim())    return res.status(400).json({ success:false, message:'Project name required.' });
    if (!description?.trim())    return res.status(400).json({ success:false, message:'Description required.' });
    if (!clientName?.trim())     return res.status(400).json({ success:false, message:'Your name required.' });
    if (!clientEmail || !validator.isEmail(clientEmail)) return res.status(400).json({ success:false, message:'Valid email required.' });

    const orderData = {
      services:    services.map(s => validator.escape(s.trim())),
      projectName: validator.escape(projectName.trim()),
      description: description.trim(),
      budget:      budget    ? validator.escape(budget.trim())      : 'Not specified',
      timeline:    timeline  ? validator.escape(timeline.trim())    : 'Not specified',
      clientName:  validator.escape(clientName.trim()),
      clientEmail: validator.normalizeEmail(clientEmail.trim()),
      clientPhone: clientPhone ? validator.escape(clientPhone.trim()) : '',
      extraNotes:  extraNotes  ? extraNotes.trim()                   : '',
      ipAddress:   req.ip,
      userId:      req.user?.id || null,
    };

    const order = await Order.create(orderData);
    sendOrderNotification(orderData).catch(e => console.error('Email err:', e.message));
    console.log(`✅ Order: "${orderData.projectName}" from ${orderData.clientName}`);

    res.status(201).json({ success:true, message:"Order submitted! We'll be in touch shortly.", data:{ id:order._id } });
  } catch (err) {
    console.error('Order error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success:false, message:Object.values(err.errors).map(e=>e.message).join(', ') });
    }
    res.status(500).json({ success:false, message:'Server error.' });
  }
});

// GET /api/orders/mine — user's own orders
router.get('/mine', userAuth, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ userId: req.user.id }, { clientEmail: req.user.email }]
    }).sort({ createdAt:-1 });
    res.json({ success:true, data:orders });
  } catch {
    res.status(500).json({ success:false, message:'Server error.' });
  }
});

// GET /api/orders/all — all orders (for community view, minimal data)
router.get('/all', userAuth, async (req, res) => {
  try {
    const orders = await Order.find({}, 'projectName clientName services status budget createdAt').sort({ createdAt:-1 });
    res.json({ success:true, data:orders });
  } catch {
    res.status(500).json({ success:false, message:'Server error.' });
  }
});

// GET /api/orders — admin all orders full data
router.get('/', adminAuth, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 100;
    const filter = req.query.status ? { status:req.query.status } : {};
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt:-1 }).skip((page-1)*limit).limit(limit),
      Order.countDocuments(filter),
    ]);
    res.json({ success:true, data:orders, pagination:{ page, limit, total } });
  } catch {
    res.status(500).json({ success:false, message:'Server error.' });
  }
});

// PATCH /api/orders/:id/status — admin update status
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['new','in-progress','completed','rejected'];
    if (!valid.includes(status)) return res.status(400).json({ success:false, message:`Status must be one of: ${valid.join(', ')}` });

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new:true });
    if (!order) return res.status(404).json({ success:false, message:'Order not found.' });

    res.json({ success:true, message:`Status updated to "${status}".`, data:order });
  } catch {
    res.status(500).json({ success:false, message:'Server error.' });
  }
});

module.exports = router;
