const mongoose = require('mongoose');

const emailOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  purpose: {
    type: String,
    enum: ['customer-register', 'customer-login', 'vendor-register', 'vendor-login'],
    required: true
  },
  codeHash: {
    type: String,
    required: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastSentAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

emailOtpSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.models.EmailOtp || mongoose.model('EmailOtp', emailOtpSchema);