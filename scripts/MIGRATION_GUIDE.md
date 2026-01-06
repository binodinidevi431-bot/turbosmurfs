# Contentful to Strapi Migration Guide

This guide explains how to migrate your blog content from Contentful to Strapi.

## Prerequisites

1. Node.js v20+ installed
2. Strapi project running
3. Contentful Space ID and Access Token

## Migration Options

### Option 1: Automated Migration (Recommended)

#### Step 1: Install Dependencies

```bash
npm install contentful dotenv
```

#### Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
STRAPI_API_TOKEN=your_strapi_token (optional)
```

To get your Contentful credentials:
- Space ID: Contentful Dashboard → Settings → General Settings
- Access Token: Contentful Dashboard → Settings → API Keys → Content Delivery API

#### Step 3: Run Migration Script

```bash
# Extract data from Contentful
node scripts/migrate-contentful.js

# Review the output in data/contentful-migration.json
# Then import to Strapi
node scripts/import-to-strapi.js
```

### Option 2: Manual Migration

#### Step 1: Extract Data

Run the migration script to extract data:

```bash
node scripts/migrate-contentful.js
```

This creates `data/contentful-migration.json` with all your blog entries.

#### Step 2: Import via Strapi Admin Panel

1. Start Strapi: `npm run develop`
2. Go to Content Manager → Blog
3. For each entry in the JSON file, click "Create new entry"
4. Fill in the fields manually

### Option 3: Using the Provided Sample Data

If you want to test with your sample data first:

```bash
node scripts/import-sample-data.js
```

## Field Mapping

| Contentful Field | Strapi Field | Type | Notes |
|-----------------|--------------|------|-------|
| Name | name | String | Blog title |
| Slug | slug | UID | URL-friendly identifier |
| Blog Text | blogText | Rich Text | Converted to Markdown |
| - | contentfulRichText | JSON | Original Contentful rich text |
| Tags | tags | JSON | Array of tags |
| status | status | Enum | draft/published/archived |
| Content Type | contentType | String | Content type identifier |
| Created by | author | String | Author name |
| Last updated by | lastUpdatedBy | String | Last editor |
| Published | publishedDate | DateTime | Publication date |

## Rich Text Conversion

The migration script converts Contentful's rich text format to Markdown:

- **Headings**: Converted to # ## ### markdown headers
- **Bold/Italic**: Converted to **bold** and *italic*
- **Links**: Converted to [text](url) format
- **Lists**: Converted to markdown lists
- **Embedded Assets**: Noted as [Asset: ID] for manual handling

## Handling Embedded Assets

Embedded images in Contentful rich text need special attention:

1. Assets are listed in the `embeddedAssets` field of each entry
2. Download images from Contentful URLs
3. Upload to Strapi's Media Library
4. Update the rich text to reference new Strapi media URLs

## Troubleshooting

### Connection Issues

If you get connection errors:
- Verify your Contentful credentials
- Check your internet connection
- Ensure Strapi is running on port 1337

### Import Errors

If entries fail to import:
- Check field validation in Strapi schema
- Verify required fields are present
- Review error messages in console

### Rich Text Issues

If rich text doesn't look right:
- Use the `contentfulRichText` field to preserve original structure
- Manually edit in Strapi's rich text editor if needed

## Post-Migration Checklist

- [ ] All entries imported successfully
- [ ] Slugs are correct and unique
- [ ] Published dates are accurate
- [ ] Tags are properly formatted
- [ ] Rich text formatting preserved
- [ ] Embedded assets handled
- [ ] Author information transferred
- [ ] URLs updated in content

## Support

For issues or questions:
1. Check Strapi documentation: https://docs.strapi.io
2. Review migration logs in console
3. Check `data/contentful-migration.json` for data accuracy