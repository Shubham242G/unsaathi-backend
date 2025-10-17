const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Blog = require('../models/Blog');

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create blog
router.post('/', auth, async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update blog
router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete blog
router.delete('/:id', auth, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Blog deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET a single blog post by ID
router.get('/:id', async (req, res) => {
  console.log(`Request received for blog ID: ${req.params.id}`);
  try {
    // Find the blog by its ID, which is passed in the URL parameters
    const blog = await Blog.findById(req.params.id);

    // If no blog is found with that ID, return a 404 error
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }

    // If the blog is found, send it back as a JSON response
    res.json(blog);
    
  } catch (err) {
    console.error(err.message);

    // If the provided ID is not a valid MongoDB ObjectId, it will throw an error
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blog not found' });
    }

    // For any other errors, send a generic server error
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router;