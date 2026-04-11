const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * GET /api/health
 * Public — Health check for monitoring
 */
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
