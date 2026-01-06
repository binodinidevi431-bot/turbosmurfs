/**
 * Import blog data from CSV file
 * 
 * Usage:
 * 1. Install dependencies: npm install csv-parser
 * 2. Place your CSV file in data/blogs.csv
 * 3. Run: node scripts/import-csv.js
 * 
 * CSV Format:
 * Name,Content Type,Updated,Last updated by,Blog Text,Created,Published,Created by,Tags,Slug,status
 */

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

async function importFromCSV() {
  console.log('Starting CSV import to Strapi...\n');

  const csvPath = path.join(__dirname, '../data/blogs.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found at ${csvPath}`);
    console.log('Please place your CSV file at: data/blogs.csv\n');
    console.log('Expected CSV columns:');
    console.log('Name, Content Type, Updated, Last updated by, Blog Text, Created, Published, Created by, Tags, Slug, status');
    process.exit(1);
  }

  const entries = [];

  // Read and parse CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Parse tags - handle both array and comma-separated string
        let tags = [];
        if (row.Tags) {
          try {
            tags = JSON.parse(row.Tags);
          } catch {
            tags = row.Tags.split(',').map(t => t.trim()).filter(Boolean);
          }
        }

        // Create entry object
        const entry = {
          name: row.Name || row.name || 'Untitled',
          slug: row.Slug || row.slug || '',
          blogText: row['Blog Text'] || row.blogText || row['Blog text'] || '',
          tags: tags,
          status: (row.status || '').toLowerCase() || 'draft',
          contentType: row['Content Type'] || row.contentType || 'Blog',
          author: row['Created by'] || row.createdBy || row.author || '',
          lastUpdatedBy: row['Last updated by'] || row.lastUpdatedBy || '',
          publishedDate: row.Published || row.published || row.Created || row.created || null
        };

        entries.push(entry);
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Found ${entries.length} entries in CSV\n`);

  // Save parsed data for review
  const outputPath = path.join(__dirname, '../data/csv-parsed.json');
  fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2));
  console.log(`✓ Parsed data saved to: ${outputPath}\n`);

  // Check Strapi connection first
  console.log('Testing connection to Strapi...');
  try {
    const axios = require('axios');
    const testResponse = await axios.get('http://localhost:1337/api/blogs');
    console.log('✓ Connection successful\n');
  } catch (error) {
    console.error('✗ Cannot connect to Strapi at http://localhost:1337');
    console.error('Make sure Strapi is running: npm run develop');
    console.error(`Error: ${error.message}\n`);
    process.exit(1);
  }

  // Import to Strapi
  let successCount = 0;
  let errorCount = 0;
  const axios = require('axios');

  for (const entry of entries) {
    try {
      const response = await axios.post('http://localhost:1337/api/blogs', {
        data: {
          ...entry,
          publishedAt: entry.status === 'published' ? entry.publishedDate : null
        }
      });

      console.log(`✓ Imported: ${entry.name}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed: ${entry.name}`);
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

importFromCSV();