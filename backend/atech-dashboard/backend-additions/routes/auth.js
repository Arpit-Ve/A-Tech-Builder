const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const validator = require('validator');
const User    = require('../models/User');

const SECRET  = process.env.JWT_SECRET || 'atech-secret-change-this';
const sign    = (payload) => jwt.sign(payload, SECRET, { expiresIn:'7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim())               return res.status(400).json({ success:false, message:'Name is required.' });
    if (!email || !validator.isEmail(email)) return res.status(400).json({ success:false, message:'Valid email required.' });
    if (!password || password.length < 6)   return res.status(400).json({ success:false, message:'Password min 6 chars.' });

    if (await User.findOne({ email:email.toLowerCase() }))
      return res.status(400).json({ success:false, message:'Email already registered.' });

    const user  = await User.create({ name:name.trim(), email:email.toLowerCase(), password });
    const token = sign({ id:user._id, email:user.email });

    res.status(201).json({ success:true, token, user:{ id:user._id, name:user.name, email:user.email, createdAt:user.createdAt } });
  } catch (err) {
    console.error('[Register]', err.message);
    res.status(500).json({ success:false, message:'Server error.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message:'Email and password required.' });

    const user = await User.findOne({ email:email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success:false, message:'Invalid email or password.' });

    const token = sign({ id:user._id, email:user.email });
    res.json({ success:true, token, user:{ id:user._id, name:user.name, email:user.email, createdAt:user.createdAt } });
  } catch (err) {
    res.status(500).json({ success:false, message:'Server error.' });
  }
});

// POST /api/auth/admin-login
router.post('/admin-login', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY)
    return res.status(401).json({ success:false, message:'Invalid admin key.' });

  const token = sign({ role:'admin' });
  res.json({ success:true, token, admin:{ name:"Arpit & Ansh", role:'admin' } });
});

module.exports = router;
