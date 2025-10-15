require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

const allowedOrigins = [
  'https://unsaathi.com',
    'https://www.unsaathi.com',
  'https://admin.unsaathi.com',
  'http://localhost:3000', // Allow your local frontend for development
  'http://localhost:3001'  // Allow your local admin frontend for development
];

const corsOptions = {
  origin: function (origin, callback) {
    // Check if the incoming origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // If it is, allow the request
      callback(null, true);
    } else {
      // If it's not, block the request
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // This allows the server to accept cookies from the browser
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Use the cors middleware with your options
app.use(cors(corsOptions)); // <-- This line applies the CORS policy to all incoming requests
app.use(express.json());

// Uploads folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/health', (req,res)=>res.send('OK'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/upload', require('./routes/upload'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
