const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, default: '' },
  images: [{ type: String }],
  seoFocusKeyword: { type: String, default: '' },
  seoTitle: { type: String, default: '' },
  seoMetaDescription: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);