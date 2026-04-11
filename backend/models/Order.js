const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Link to registered user (optional — works for guest orders too)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  services: {
    type: [String],
    required: [true, 'At least one service is required'],
    validate: { validator: (v) => v.length > 0, message: 'At least one service must be selected' },
  },
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [10000, 'Description cannot exceed 10000 characters'],
  },
  budget: { type: String, trim: true, default: 'Not specified' },
  timeline: { type: String, trim: true, default: 'Not specified' },
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  clientEmail: {
    type: String,
    required: [true, 'Client email is required'],
    trim: true,
    lowercase: true,
    maxlength: [150, 'Email cannot exceed 150 characters'],
  },
  clientPhone: { type: String, trim: true, default: '' },
  extraNotes: { type: String, trim: true, maxlength: [5000, 'Extra notes cannot exceed 5000 characters'], default: '' },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'completed', 'rejected'],
    default: 'new',
  },
  ipAddress: { type: String, default: '' },
}, { timestamps: true });

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ clientEmail: 1 });

module.exports = mongoose.model('Order', orderSchema);
