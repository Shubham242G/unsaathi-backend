// models/FAQ.js
const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  category: { type: String, default: 'general' }, // e.g., 'divorce', 'custody'
}, { timestamps: true });

module.exports = mongoose.model('FAQ', faqSchema);
