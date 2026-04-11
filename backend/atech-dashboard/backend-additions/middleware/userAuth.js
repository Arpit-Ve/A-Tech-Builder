const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'atech-secret-change-this';

module.exports = (req, res, next) => {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ success:false, message:'Auth required.' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ success:false, message:'Invalid or expired token.' });
  }
};
