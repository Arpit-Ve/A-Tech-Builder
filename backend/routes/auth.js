const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'atech-jwt-secret-change-this';
const JWT_EXPIRES = '7d';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required.' });
    if (!email || !validator.isEmail(email)) return res.status(400).json({ success: false, message: 'Valid email is required.' });
    if (!password || password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: 'An account with this email already exists.' });

    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password });

    const token = generateToken({ id: user._id, email: user.email });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    console.error('[Register]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const token = generateToken({ id: user._id, email: user.email });

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    console.error('[Login]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * POST /api/auth/admin-login
 * Uses the ADMIN_API_KEY from .env as the password
 */
router.post('/admin-login', (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json({ success: false, message: 'API key is required.' });

    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = generateToken({ role: 'admin' });

    res.json({
      success: true,
      message: 'Admin login successful!',
      token,
      admin: { name: 'Arpit & Ansh', role: 'admin' },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
