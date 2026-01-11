const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, default: '' },

    // 🔽 CHANGED: image structure for Base64 handling
    images: {
      thumbnail: { type: String, default: '' }, // small base64
      cover: { type: String, default: '' },     // full base64
    },

    seoFocusKeyword: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoMetaDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', BlogSchema);
