const express = require('express');
const FAQ = require('../models/Faq');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const router = express.Router();

console.log('✅ FAQ ROUTE FILE LOADED');
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1 }).lean();

    const formatted = faqs.map(faq => ({
      _id: faq._id.toString(),
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'general',
      order: faq.order || 0,
      isActive: faq.isActive !== false
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// ADMIN POST
router.post('/', auth, async (req, res) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();
    res.status(201).json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN PUT - BULLETPROOF
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('🔧 PUT id:', req.params.id);
    
    // STOP EXECUTION if invalid ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({ error: 'Invalid FAQ ID: ' + req.params.id });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ObjectId format' });
    }
    
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    res.json(faq);
  } catch (err) {
    console.error('PUT ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// router.get('/public', async (req, res) => {
//   const faqs = await FAQ.find({ isActive: true }).sort({ order: 1 });
//   res.json(faqs.map(f => ({ question: f.question, answer: f.answer })));
// });

router.get('/by-category/:category', async (req, res) => {
  const { category } = req.params;
  const { blogId } = req.query;

  try {
    const filter = {
      isActive: true,
      category: { $regex: new RegExp(category, 'i') }  // Case-insensitive
    };

    // If blogId provided, filter by it. Otherwise get general FAQs for that category
    if (blogId) {
      filter.blogId = blogId;
    }

    console.log('🔍 FAQ Filter:', filter);  // Debug log

    const faqs = await FAQ.find(filter).sort({ order: 1 }).lean();

    res.json(
      faqs.map(faq => ({
        _id: faq._id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'general',
        order: faq.order || 0,
        isActive: faq.isActive !== false
      }))
    );
  } catch (err) {
    console.error('❌ FAQ Route Error:', err);  // This will show in backend console
    res.status(500).json({ error: err.message });
  }
});

// ADMIN DELETE - BULLETPROOF  
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('🗑️ DELETE id:', req.params.id);
    
    // STOP EXECUTION if invalid ID (LINE 33 was HERE)
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      console.log('🚫 BLOCKED invalid DELETE ID:', req.params.id);
      return res.status(400).json({ error: 'Invalid FAQ ID: ' + req.params.id });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ObjectId format' });
    }
    
    const result = await FAQ.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'FAQ not found' });
    
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
