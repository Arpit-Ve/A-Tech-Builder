const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * GET /api/health
 * Public — Health check for monitoring
 */
/**
 * GET /api/health/test-mail
 * Admin — Send a test email to verify configuration
 */
router.get('/test-mail', async (req, res) => {
    try {
        const { sendMail } = require('../utils/mailer');
        await sendMail({
            to: process.env.SMTP_EMAIL,
            subject: '🔍 A\'tech Builder Test Email',
            html: '<h1>It works!</h1><p>If you see this, your Render mail server is correctly configured.</p>'
        });
        res.json({ success: true, message: 'Test email sent to ' + process.env.SMTP_EMAIL });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbStates[dbState] || 'unknown',
        uptime: Math.floor(process.uptime()) + 's'
    });
});

module.exports = router;
