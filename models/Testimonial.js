const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);