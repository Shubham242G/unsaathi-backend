const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false }); // No separate _id for embedded docs

const BlogSchema = new mongoose.Schema(
  {
    slug: { 
      type: String, 
      required: [true, 'Slug is required for URL'], 
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    date: { type: Date, required: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, default: '' },

    images: {
      thumbnail: { type: String, default: '' },
      cover: { type: String, default: '' },
    },

    // ✅ NEW: Blog-specific FAQs (embedded array)
    faqs: [FaqSchema],

    seoFocusKeyword: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoMetaDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', BlogSchema);