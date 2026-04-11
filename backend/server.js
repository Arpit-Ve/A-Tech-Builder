// Force Google DNS — fixes Jio/Reliance ISP blocking MongoDB SRV lookups
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const { initMailer } = require('./utils/mailer');

// Import routes
const contactRoutes = require('./routes/contact');
const orderRoutes = require('./routes/order');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Security Middleware =====
// app.use(helmet({
//     contentSecurityPolicy: false,
//     crossOriginResourcePolicy: { policy: 'cross-origin' }
// }));

// ===== CORS =====
const allowedOrigins = [
    'http://127.0.0.1:5000',
    'http://localhost:5000',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'https://a-tech-builder-git-main-arpit-ves-projects.vercel.app',
    'https://a-tech-builder.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
    credentials: true
}));

app.options('*', cors());
// ===== Rate Limiting =====
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const formLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // max 10 submissions per hour per IP
    message: { success: false, message: 'Too many submissions. Please try again in an hour.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(generalLimiter);

// ===== Body Parsing =====
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ===== Request Logging =====
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ===== Serve Frontend Static Files =====
// Disable etags so browsers don't reuse the old cached CSP headers
app.disable('etag');
app.use(express.static(path.join(__dirname, '..'), {
    etag: false,
    lastModified: false,
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
}));
app.options('*', cors()); // Handle preflight requests

// ===== API Routes =====
app.use('/api/contact', formLimiter, contactRoutes);
app.use('/api/orders', formLimiter, orderRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// ===== Root Route =====
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 A tech BuilderAPI is running!',
        version: '1.0.0',
        endpoints: {
            health: 'GET /api/health',
            contact: 'POST /api/contact',
            orders: 'POST /api/orders'
        }
    });
});

// ===== 404 Handler =====
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.path}`
    });
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error.'
    });
});

// ===== Start Server =====
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Initialize email transporter
        await initMailer();

        // Start listening
        app.listen(PORT, () => {
            console.log('');
            console.log('╔══════════════════════════════════════════╗');
            console.log('║   🚀 A tech Builder Backend is LIVE!     ║');
            console.log(`║   📡 Server:  http://localhost:${PORT}       ║`);
            console.log(`║   🏥 Health:  http://localhost:${PORT}/api/health ║`);
            console.log('║   📬 Contact: POST /api/contact         ║');
            console.log('║   📦 Orders:  POST /api/orders          ║');
            console.log('╚══════════════════════════════════════════╝');
            console.log('');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
