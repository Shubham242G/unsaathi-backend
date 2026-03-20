require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const allowedOrigins = [
  'https://unsaathi.com',
  'https://www.unsaathi.com',
  'https://admin.unsaathi.com',
  'https://unsaathi-admin.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',     
  'http://127.0.0.1:3000',     
  'http://admin.unsaathi.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));        // ✅ Base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes - UPLOAD REMOVED ✅
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/faq', require('./routes/faq'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
