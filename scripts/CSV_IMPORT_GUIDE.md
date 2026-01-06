# CSV Import Guide for Blog Migration

This guide explains how to upload blog data from a CSV file and check the imported data.

## Step 1: Install Dependencies

```bash
npm install csv-parser
```

## Step 2: Prepare Your CSV File

### CSV Format

Create a CSV file with these columns (exact names):

```
Name,Content Type,Updated,Last updated by,Blog Text,Created,Published,Created by,Tags,Slug,status
```

### Example CSV Content

```csv
Name,Content Type,Updated,Last updated by,Blog Text,Created,Published,Created by,Tags,Slug,status
"Exploring Slotopia Slots","Blog","2026-01-05","Emanuel Pereira","# Introduction...","2026-01-05","2026-01-05","Emanuel Pereira","gaming,slots","exploring-slotopia-slots","published"
```

### CSV Field Details

| Column | Required | Format | Example |
|--------|----------|--------|---------|
| Name | Yes | Text | "My Blog Post" |
| Content Type | No | Text | "Blog" |
| Updated | No | Date | "2026-01-05" |
| Last updated by | No | Text | "John Doe" |
| Blog Text | Yes | Text/Markdown | "# Heading\n\nContent..." |
| Created | No | Date | "2026-01-05" |
| Published | No | Date | "2026-01-05" |
| Created by | No | Text | "Jane Doe" |
| Tags | No | Array/CSV | "tag1,tag2" or "[\"tag1\",\"tag2\"]" |
| Slug | Yes | Text | "my-blog-post" |
| status | No | Enum | "published" or "draft" |

### Handling Special Characters

- Wrap text fields in quotes if they contain commas
- Use `\n` for line breaks in Blog Text
- For rich content, use Markdown format

## Step 3: Place CSV File

Save your CSV file as: `data/blogs.csv`

```
turbsmurf/
  data/
    blogs.csv  ← Your CSV file here
```

## Step 4: Import CSV to Strapi

### Make sure Strapi is running

```bash
npm run develop
```

### Run import script

```bash
npm run import:csv
```

### What happens during import:

1. ✓ Script reads `data/blogs.csv`
2. ✓ Parses all rows
3. ✓ Saves parsed data to `data/csv-parsed.json` (for review)
4. ✓ Imports each entry to Strapi via API
5. ✓ Shows success/error count

## Step 5: Check Imported Data

### View all blogs

```bash
npm run check:blogs
```

This shows a table with all blogs:
```
──────────────────────────────────────────────────────────────────────────────────
ID    Name                                    Slug                          Status      Published
──────────────────────────────────────────────────────────────────────────────────
1     Exploring Slotopia Slots                exploring-slotopia-slots      published   1/5/2026
──────────────────────────────────────────────────────────────────────────────────
```

### Check specific blog by ID

```bash
npm run check:blogs -- --id=1
```

### Check specific blog by slug

```bash
npm run check:blogs -- --slug=exploring-slotopia-slots
```

### Get blog count

```bash
npm run check:blogs -- --count
```

### Export all blogs to JSON

```bash
npm run check:blogs -- --export
```

This creates `data/blogs-export.json` with all blog data.

## Troubleshooting

### Error: CSV file not found

Make sure your CSV file is at `turbsmurf/data/blogs.csv`

### Error: Cannot connect to Strapi

1. Make sure Strapi is running: `npm run develop`
2. Verify it's running on http://localhost:1337
3. Check if the blog content type exists

### Import failures

- Check CSV format matches expected columns
- Ensure required fields (Name, Slug) are present
- Review `data/csv-parsed.json` to see parsed data
- Check console for specific error messages

### Missing data in Strapi

- Verify field mapping in schema matches CSV columns
- Check Strapi Admin Panel → Content-Type Builder → Blog
- Review API permissions in Settings → Roles → Public

## Alternative: Manual CSV Upload

If automated import doesn't work:

1. Run `npm run import:csv` to generate `data/csv-parsed.json`
2. Open Strapi Admin Panel
3. Go to Content Manager → Blog
4. Manually create entries using data from `csv-parsed.json`

## Converting from Contentful Export

If you exported from Contentful:

1. Contentful → Export to CSV
2. Save as `data/blogs.csv`
3. Run `npm run import:csv`

Note: Contentful's rich text might need conversion. Use the `migrate-contentful.js` script for better rich text handling.

## Batch Operations

### Import large CSV files

For large datasets (100+ entries), consider:

1. Split CSV into smaller batches
2. Import one batch at a time
3. Use `--count` to verify imports

### Update existing entries

To update instead of create:
1. Export current blogs: `npm run check:blogs -- --export`
2. Modify the JSON
3. Use Strapi's update API endpoint

## Next Steps

After successful import:

- [ ] Verify all entries in Strapi Admin Panel
- [ ] Check slugs are unique
- [ ] Verify rich text formatting
- [ ] Update embedded images if any
- [ ] Test blog display on frontend
- [ ] Backup the database