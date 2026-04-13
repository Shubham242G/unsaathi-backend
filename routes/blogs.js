const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Blog = require('../models/Blog');

const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
};

// GET all blogs
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// CREATE blog
router.post('/', auth, async (req, res) => {
  try {
    console.log('REQ BODY BLOG CREATE:', req.body);
    console.log('REQ BODY IMAGES:', req.body.images);

    let { slug, title, ...blogData } = req.body;

    const finalSlug = generateSlug(slug || title);

    const existingBlog = await Blog.findOne({ slug: finalSlug });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: `Slug "${finalSlug}" already exists. Please choose another or use "Generate" button.`,
        available: false
      });
    }

    const blog = new Blog({
      ...blogData,
      slug: finalSlug,
      title
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// UPDATE blog
router.put('/:id', auth, async (req, res) => {
  try {
    let { slug, title, images, ...blogData } = req.body;

    // Format images if they are being updated
    if (images) {
      blogData.images = {
        thumbnail: images.thumbnail || images.cover || '',
        cover: images.cover || images.thumbnail || '',
        gallery: images.gallery || []  // ← IMPORTANT: Save gallery array
      };
    }

    if (slug && slug !== req.body._originalSlug) {
      const finalSlug = generateSlug(slug || title);
      const existingBlog = await Blog.findOne({
        slug: finalSlug,
        _id: { $ne: req.params.id }
      });

      if (existingBlog) {
        return res.status(400).json({
          success: false,
          message: `Slug "${finalSlug}" already exists. Please choose another.`,
          available: false
        });
      }

      blogData.slug = finalSlug;
    }

    if (title) {
      blogData.title = title;
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      blogData,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }

    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE blog
router.delete('/:id', auth, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Blog deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).lean();

    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }

    // Ensure gallery array exists even if empty
    if (!blog.images) {
      blog.images = { thumbnail: '', cover: '', gallery: [] };
    }
    if (!blog.images.gallery) {
      blog.images.gallery = [];
    }

    console.log('Returning blog with gallery count:', blog.images.gallery.length);
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET by id - Ensure gallery is returned
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();

    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }

    // Ensure gallery array exists even if empty
    if (!blog.images) {
      blog.images = { thumbnail: '', cover: '', gallery: [] };
    }
    if (!blog.images.gallery) {
      blog.images.gallery = [];
    }

    res.json(blog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;