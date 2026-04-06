const mongoose = require('mongoose');
const Blog = require('./models/Blog');

mongoose.connect(process.env.MONGO_URI);

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

async function migrate() {
  const blogs = await Blog.find({
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  });

  console.log(`Migrating ${blogs.length} blogs...`);

  for (const blog of blogs) {
    let baseSlug = generateSlug(blog.title);
    let finalSlug = baseSlug;
    let count = 1;

    while (await Blog.findOne({ slug: finalSlug, _id: { $ne: blog._id } })) {
      finalSlug = `${baseSlug}-${count}`;
      count++;
    }

    blog.slug = finalSlug;
    await blog.save();

    console.log(`✅ Migrated: ${blog.title} → ${blog.slug}`);
  }

  console.log('✅ Migration complete!');
  process.exit();
}

migrate();