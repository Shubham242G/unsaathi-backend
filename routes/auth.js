const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Signup
// Signup - FIXED (no manual hashing)
router.post('/signup', async (req, res) => {
  const { username, name, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'Username already exists' });
    }

    // ✅ NO MANUAL HASHING - let pre('save') middleware handle it
    user = new User({ 
      username, 
      name, 
      password  // Plain text - middleware will hash
    });
    await user.save();

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// Login
router.post('/login', async (req, res) => {
  console.log('🔍 LOGIN START');
  console.log('1. req.body:', req.body);
  
  const { username, password } = req.body;
  
  try {
    console.log('2. Looking for user:', username);
    const user = await User.findOne({ username });
    console.log('3. User found:', !!user, user ? { _id: user._id, username: user.username } : 'NO USER');
    
    if (!user) {
      console.log('❌ NO USER - sending 400');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log('4. Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('5. Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ PASSWORD MISMATCH - sending 400');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log('6. All good, generating JWT');
    console.log('7. JWT_SECRET exists?', !!process.env.JWT_SECRET);
    const payload = { user: { id: user._id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
    console.log('✅ TOKEN GENERATED');

    res.json({ token });
  } catch (err) {
    console.error('💥 LOGIN ERROR:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
