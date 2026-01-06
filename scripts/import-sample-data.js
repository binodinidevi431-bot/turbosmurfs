/**
 * Import sample blog data from Contentful format
 * This script processes the sample data you provided
 */

const fs = require('fs-extra');
const path = require('path');

// Sample data from your Contentful export
const sampleData = {
  name: "Exploring Slotopia Slots: Themes, Volatility, and Play Style",
  contentType: "Blog",
  updated: "2026-01-05",
  lastUpdatedBy: "Emanuel Pereira",
  blogText: {
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "heading-1",
        content: [{
          nodeType: "text",
          value: "Introduction: What Slotopia Casino Slots Offer",
          marks: [{ type: "bold" }]
        }]
      },
      {
        nodeType: "paragraph",
        content: [{
          nodeType: "text",
          value: "Slotopia is a collection of slot games at American Luck built for quick, colorful play. The lobby groups these titles together so players can jump in without having to study long rule sheets."
        }]
      },
      // ... rest of the content structure
    ]
  },
  created: "2026-01-05",
  published: "2026-01-05T00:00+00:00",
  createdBy: "Emanuel Pereira",
  slug: "exploring-slotopia-slots-themes-volatility-playstyle",
  status: "published"
};

// Convert Contentful rich text to Markdown
function convertToMarkdown(document) {
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
          });
        }
        markdown += text;
        break;

      case 'hyperlink':
        const linkText = content.map(child => processNode(child)).join('');
        markdown += `[${linkText}](${node.data.uri})`;
        break;

      case 'embedded-asset-block':
        const assetId = node.data?.target?.sys?.id;
        if (assetId) {
          markdown += `\n\n![Image](${assetId})\n\n`;
        }
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

async function importSampleData() {
  console.log('Importing sample blog data to Strapi...\n');

  const blogEntry = {
    name: sampleData.name,
    slug: sampleData.slug,
    blogText: convertToMarkdown(sampleData.blogText),
    contentfulRichText: sampleData.blogText,
    tags: [],
    status: sampleData.status,
    contentType: sampleData.contentType,
    author: sampleData.createdBy,
    lastUpdatedBy: sampleData.lastUpdatedBy,
    publishedDate: sampleData.published
  };

  // Save to JSON for review
  const outputPath = path.join(__dirname, '../data/sample-blog.json');
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeJson(outputPath, blogEntry, { spaces: 2 });

  console.log(`✓ Sample data prepared and saved to: ${outputPath}`);
  console.log(`\nConverted Markdown preview:\n`);
  console.log('---');
  console.log(blogEntry.blogText.substring(0, 500) + '...');
  console.log('---\n');

  console.log('To import this entry to Strapi:');
  console.log('1. Start Strapi: npm run develop');
  console.log('2. Go to Content Manager → Blog → Create new entry');
  console.log('3. Copy fields from data/sample-blog.json');
  console.log('\nOr run the automated import (requires Strapi API access)');
}

importSampleData();