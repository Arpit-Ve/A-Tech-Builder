// ============================================
// ADD THESE TO YOUR EXISTING server.js
// ============================================

// 1. Install new packages first:
//    npm install jsonwebtoken bcryptjs

// 2. Add this near the top with your other requires:
const authRoutes = require('../../routes/auth');

// 3. Add this with your other API routes (after the existing ones):
app.use('/api/auth', authRoutes);

// 4. Also add JWT_SECRET to your .env file:
// JWT_SECRET=atech-super-secret-jwt-key-2026-change-this

// ============================================
// THAT'S IT — everything else stays the same!
// ============================================
