/**
 * Check and display blog data from Strapi
 * 
 * Usage: node scripts/check-blogs.js [options]
 * 
 * Options:
 *   --id=123          Show specific blog by ID
 *   --slug=my-blog    Show specific blog by slug
 *   --export          Export all blogs to JSON file
 *   --count           Show only count
 */

const fs = require('fs-extra');
const path = require('path');

async function checkBlogs() {
  const args = process.argv.slice(2);
  const options = {
    id: null,
    slug: null,
    export: false,
    count: false
  };

  // Parse arguments
  args.forEach(arg => {
    if (arg.startsWith('--id=')) {
      options.id = arg.split('=')[1];
    } else if (arg.startsWith('--slug=')) {
      options.slug = arg.split('=')[1];
    } else if (arg === '--export') {
      options.export = true;
    } else if (arg === '--count') {
      options.count = true;
    }
  });

  console.log('Checking blog data in Strapi...\n');

  try {
    const axios = require('axios');
    let url = 'http://localhost:1337/api/blogs?populate=*';
    
    // Fetch specific blog
    if (options.id) {
      url = `http://localhost:1337/api/blogs/${options.id}?populate=*`;
    } else if (options.slug) {
      url = `http://localhost:1337/api/blogs?filters[slug][$eq]=${options.slug}&populate=*`;
    }

    const response = await axios.get(url);
    const result = response.data;
    const blogs = result.data;

    // Just show count
    if (options.count) {
      const count = Array.isArray(blogs) ? blogs.length : (blogs ? 1 : 0);
      console.log(`Total blogs: ${count}`);
      return;
    }

    // Show specific blog
    if (options.id || options.slug) {
      const blog = Array.isArray(blogs) ? blogs[0] : blogs;
      if (!blog) {
        console.log('Blog not found');
        return;
      }
      console.log('Blog Details:');
      console.log('─'.repeat(60));
      console.log(`ID: ${blog.id}`);
      console.log(`Name: ${blog.attributes.name}`);
      console.log(`Slug: ${blog.attributes.slug}`);
      console.log(`Status: ${blog.attributes.status}`);
      console.log(`Author: ${blog.attributes.author || 'N/A'}`);
      console.log(`Published: ${blog.attributes.publishedDate || 'N/A'}`);
      console.log(`Tags: ${blog.attributes.tags ? JSON.stringify(blog.attributes.tags) : 'N/A'}`);
      console.log(`\nBlog Text Preview:`);
      console.log('─'.repeat(60));
      const preview = blog.attributes.blogText?.substring(0, 300) || 'No content';
      console.log(preview + '...');
      console.log('─'.repeat(60));
      return;
    }

    // Show all blogs
    if (!Array.isArray(blogs)) {
      console.log('No blogs found');
      return;
    }

    console.log(`Found ${blogs.length} blogs:\n`);
    
    // Display table
    console.log('─'.repeat(100));
    console.log(
      'ID'.padEnd(6) + 
      'Name'.padEnd(40) + 
      'Slug'.padEnd(30) + 
      'Status'.padEnd(12) + 
      'Published'
    );
    console.log('─'.repeat(100));

    blogs.forEach(blog => {
      const id = String(blog.id).padEnd(6);
      const name = (blog.attributes.name || '').substring(0, 37).padEnd(40);
      const slug = (blog.attributes.slug || '').substring(0, 27).padEnd(30);
      const status = (blog.attributes.status || '').padEnd(12);
      const published = blog.attributes.publishedDate 
        ? new Date(blog.attributes.publishedDate).toLocaleDateString()
        : 'N/A';
      
      console.log(id + name + slug + status + published);
    });

    console.log('─'.repeat(100));
    console.log(`\nTotal: ${blogs.length} blogs`);

    // Export option
    if (options.export) {
      const exportPath = path.join(__dirname, '../data/blogs-export.json');
      await fs.writeJson(exportPath, blogs, { spaces: 2 });
      console.log(`\n✓ Exported to: ${exportPath}`);
    }

    console.log('\nOptions:');
    console.log('  --id=123          Show specific blog by ID');
    console.log('  --slug=my-blog    Show specific blog by slug');
    console.log('  --export          Export all blogs to JSON');
    console.log('  --count           Show only count');

  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nMake sure:');
    console.error('1. Strapi is running (npm run develop)');
    console.error('2. Blog content type exists');
    console.error('3. API permissions are configured');
  }
}

checkBlogs();