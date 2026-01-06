/**
 * Migration script for Contentful to Strapi
 * 
 * Usage:
 * 1. Install dependencies: npm install contentful dotenv
 * 2. Create .env file with CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN
 * 3. Run: node scripts/migrate-contentful.js
 */

const contentful = require('contentful');
const fs = require('fs-extra');
const path = require('path');

// Contentful rich text to Markdown converter
function convertRichTextToMarkdown(document) {
  if (!document || !document.content) return '';

  let markdown = '';

  function processNode(node) {
    const nodeType = node.nodeType;
    const content = node.content || [];

    switch (nodeType) {
      case 'document':
        content.forEach(child => markdown += processNode(child));
        break;

      case 'heading-1':
        markdown += '# ';
        content.forEach(child => markdown += processNode(child));
        markdown += '\n\n';
        break;

      case 'heading-2':
        markdown += '## ';
        content.forEach(child => markdown += processNode(child));
        markdown += '\n\n';
        break;

      case 'heading-3':
        markdown += '### ';
        content.forEach(child => markdown += processNode(child));
        markdown += '\n\n';
        break;

      case 'paragraph':
        content.forEach(child => markdown += processNode(child));
        markdown += '\n\n';
        break;

      case 'text':
        let text = node.value || '';
        if (node.marks && node.marks.length > 0) {
          node.marks.forEach(mark => {
            if (mark.type === 'bold') text = `**${text}**`;
            if (mark.type === 'italic') text = `*${text}*`;
            if (mark.type === 'underline') text = `<u>${text}</u>`;
            if (mark.type === 'code') text = `\`${text}\``;
          });
        }
        markdown += text;
        break;

      case 'hyperlink':
        const linkText = content.map(child => processNode(child)).join('');
        markdown += `[${linkText}](${node.data.uri})`;
        break;

      case 'unordered-list':
        content.forEach(child => markdown += processNode(child));
        markdown += '\n';
        break;

      case 'ordered-list':
        content.forEach((child, index) => {
          markdown += `${index + 1}. `;
          markdown += processNode(child);
        });
        markdown += '\n';
        break;

      case 'list-item':
        markdown += '- ';
        content.forEach(child => markdown += processNode(child));
        markdown += '\n';
        break;

      case 'blockquote':
        content.forEach(child => {
          const text = processNode(child);
          markdown += `> ${text}`;
        });
        markdown += '\n';
        break;

      case 'embedded-asset-block':
        const assetId = node.data?.target?.sys?.id;
        if (assetId) {
          markdown += `[Asset: ${assetId}]\n\n`;
        }
        break;

      case 'hr':
        markdown += '---\n\n';
        break;

      default:
        content.forEach(child => markdown += processNode(child));
        break;
    }

    return markdown;
  }

  processNode(document);
  return markdown.trim();
}

// Main migration function
async function migrateFromContentful() {
  console.log('Starting Contentful to Strapi migration...\n');

  // Load environment variables
  require('dotenv').config();

  const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
  const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
    console.error('Error: Please set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN in .env file');
    process.exit(1);
  }

  // Initialize Contentful client
  const client = contentful.createClient({
    space: CONTENTFUL_SPACE_ID,
    accessToken: CONTENTFUL_ACCESS_TOKEN
  });

  try {
    // Fetch all blog entries from Contentful
    console.log('Fetching entries from Contentful...');
    const entries = await client.getEntries({
      content_type: 'blog', // Adjust this to match your Contentful content type ID
      limit: 1000
    });

    console.log(`Found ${entries.items.length} blog entries\n`);

    // Prepare migration data
    const migratedData = [];

    for (const entry of entries.items) {
      const fields = entry.fields;
      
      // Extract embedded assets
      const embeddedAssets = [];
      if (fields.blogText?.content) {
        function extractAssets(node) {
          if (node.nodeType === 'embedded-asset-block') {
            const assetId = node.data?.target?.sys?.id;
            if (assetId) {
              // Find the asset in includes
              const asset = entries.includes?.Asset?.find(a => a.sys.id === assetId);
              if (asset) {
                embeddedAssets.push({
                  id: assetId,
                  url: asset.fields.file.url,
                  title: asset.fields.title,
                  contentType: asset.fields.file.contentType
                });
              }
            }
          }
          if (node.content) {
            node.content.forEach(child => extractAssets(child));
          }
        }
        extractAssets(fields.blogText);
      }

      const blogData = {
        name: fields.name || fields.title || 'Untitled',
        slug: fields.slug || entry.sys.id,
        blogText: fields.blogText ? convertRichTextToMarkdown(fields.blogText) : '',
        contentfulRichText: fields.blogText || null,
        tags: fields.tags || [],
        status: entry.sys.publishedAt ? 'published' : 'draft',
        contentType: fields.contentType || entry.sys.contentType?.sys?.id || 'Blog',
        author: fields.createdBy || entry.sys.createdBy?.sys?.id,
        lastUpdatedBy: fields.lastUpdatedBy || entry.sys.updatedBy?.sys?.id,
        publishedDate: entry.sys.publishedAt || entry.sys.createdAt,
        embeddedAssets: embeddedAssets,
        contentfulId: entry.sys.id,
        createdAt: entry.sys.createdAt,
        updatedAt: entry.sys.updatedAt
      };

      migratedData.push(blogData);

      console.log(`✓ Processed: ${blogData.name}`);
    }

    // Save migration data to JSON file
    const outputPath = path.join(__dirname, '../data/contentful-migration.json');
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeJson(outputPath, migratedData, { spaces: 2 });

    console.log(`\n✓ Migration data saved to: ${outputPath}`);
    console.log(`\nNext steps:`);
    console.log(`1. Review the migration data in ${outputPath}`);
    console.log(`2. Run: node scripts/import-to-strapi.js to import into Strapi`);
    console.log(`3. Or manually import via Strapi Admin Panel`);

  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrateFromContentful();