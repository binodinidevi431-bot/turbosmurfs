/**
 * Import script for migrated Contentful data to Strapi
 * 
 * Usage:
 * 1. Make sure Strapi is running (npm run develop)
 * 2. Run: node scripts/import-to-strapi.js
 */

const fs = require('fs-extra');
const path = require('path');

async function importToStrapi() {
  console.log('Starting import to Strapi...\n');

  // Read migration data
  const dataPath = path.join(__dirname, '../data/contentful-migration.json');
  
  if (!await fs.pathExists(dataPath)) {
    console.error(`Error: Migration data not found at ${dataPath}`);
    console.error('Please run: node scripts/migrate-contentful.js first');
    process.exit(1);
  }

  const migrationData = await fs.readJson(dataPath);
  console.log(`Found ${migrationData.length} entries to import\n`);

  // Import each entry
  let successCount = 0;
  let errorCount = 0;
  const axios = require('axios');

  for (const entry of migrationData) {
    try {
      const response = await axios.post('http://localhost:1337/api/blogs', {
        data: {
          name: entry.name,
          slug: entry.slug,
          blogText: entry.blogText,
          contentfulRichText: entry.contentfulRichText,
          tags: entry.tags,
          status: entry.status,
          contentType: entry.contentType,
          author: entry.author,
          lastUpdatedBy: entry.lastUpdatedBy,
          publishedDate: entry.publishedDate,
          publishedAt: entry.status === 'published' ? entry.publishedDate : null
        }
      });

      console.log(`✓ Imported: ${entry.name}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to import: ${entry.name}`);
      if (error.response) {
        console.error(`  Status: ${error.response.status}`);
        console.error(`  Error: ${error.response.data?.error?.message || error.message}`);
      } else {
        console.error(`  Error: ${error.message}`);
      }
      errorCount++;
    }
  }

  console.log(`\nImport completed:`);
  console.log(`  ✓ Success: ${successCount}`);
  console.log(`  ✗ Errors: ${errorCount}`);
}

// Run import
importToStrapi();