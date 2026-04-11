/**
 * Admin API Key Authentication Middleware
 * Protects admin-only routes (viewing submissions, updating status).
 * 
 * Usage: Pass the API key in the header:
 *   x-api-key: your-admin-api-key
 */

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'atech-jwt-secret-change-this';

const adminAuth = (req, res, next) => {
    let token = req.headers['x-api-key'];
    if (!token && req.headers['authorization']) {
        token = req.headers['authorization'].split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. Token required.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        // Fallback: If it's not a valid JWT, check if it's the raw ADMIN_API_KEY (for Postman/curl tests)
        if (token === process.env.ADMIN_API_KEY) {
            return next();
        }
        res.status(401).json({ success: false, message: 'Invalid or expired admin token.' });
    }
};

module.exports = adminAuth;
