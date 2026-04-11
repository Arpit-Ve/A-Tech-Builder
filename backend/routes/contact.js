const express = require('express');
const router = express.Router();
const validator = require('validator');
const Contact = require('../models/Contact');
const adminAuth = require('../middleware/adminAuth');
const { sendContactNotification } = require('../utils/mailer');

/**
 * POST /api/contact
 * Public — Submit a contact form message
 */
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Name is required.' });
        }
        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'A valid email is required.' });
        }
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required.' });
        }

        // Sanitize inputs
        const contactData = {
            name: validator.escape(name.trim()),
            email: validator.normalizeEmail(email.trim()),
            subject: subject ? validator.escape(subject.trim()) : 'No Subject',
            message: message.trim(), // Don't escape message content (preserve formatting)
            ipAddress: req.ip || req.connection.remoteAddress
        };

        // Save to database
        const contact = await Contact.create(contactData);

        // Send email notification (async, don't block response)
        sendContactNotification(contactData).catch(err => {
            console.error('Email notification error:', err.message);
        });

        console.log(`✅ New contact saved: "${contactData.name}" <${contactData.email}>`);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully! We\'ll get back to you soon.',
            data: { id: contact._id }
        });

    } catch (error) {
        console.error('❌ Contact submission error:', error.message);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again later.' 
        });
    }
});

/**
 * GET /api/contact
 * Admin — List all contact submissions
 */
router.get('/', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const filter = {};

        // Optional filter by read status
        if (req.query.isRead === 'true') filter.isRead = true;
        if (req.query.isRead === 'false') filter.isRead = false;

        const [contacts, total] = await Promise.all([
            Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Contact.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: contacts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('❌ Fetch contacts error:', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

/**
 * PATCH /api/contact/:id/read
 * Admin — Mark a contact as read/unread
 */
router.patch('/:id/read', adminAuth, async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact not found.' });
        }

        contact.isRead = !contact.isRead;
        await contact.save();

        res.json({
            success: true,
            message: `Contact marked as ${contact.isRead ? 'read' : 'unread'}.`,
            data: contact
        });
    } catch (error) {
        console.error('❌ Update contact error:', error.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
