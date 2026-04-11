const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'atech-jwt-secret-change-this';

// User JWT auth
const userAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = userAuth;
