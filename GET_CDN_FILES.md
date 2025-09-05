# 🚀 Get Your CDN Files Ready

## Step 1: Get File Lists from Your R2 Bucket

### Option A: Using Wrangler CLI (Recommended)
```bash
# Install Wrangler if you haven't
npm install -g wrangler

# List all files in your bucket
wrangler r2 object list lzmeme

# Save to files for easy copying
wrangler r2 object list lzmeme --prefix="memes/" > memes-list.txt
wrangler r2 object list lzmeme --prefix="assets/" > assets-list.txt  
wrangler r2 object list lzmeme --prefix="pfps/" > pfps-list.txt
```

### Option B: From Cloudflare Dashboard
1. Go to Cloudflare Dashboard → R2 → lzmeme bucket
2. Browse each folder (memes/, assets/, pfps/)
3. Copy the file names

## Step 2: Update the Generator Script

Edit `generate-cdn-manifest.js` and replace the file arrays:

```javascript
// Replace this array with your actual meme files
const memeFiles = [
  "boyfriend.webp",
  "drake.webp",
  "pikachu.webp",
  // ... add all your ~1000 meme files here
];

// Replace with your actual logo files
const logoFiles = [
  "lz_logo.webp",
  "logo_alt.webp", 
  // ... add all your logo files
];

// Replace with your actual pfp files
const pfpFiles = [
  "sample.webp",
  "avatar1.webp",
  "avatar2.webp",
  // ... add all your pfp files
];
```

## Step 3: Generate JSON Files

```bash
# Run the generator script
node generate-cdn-manifest.js
```

This will create:
- `public/templates.json` - All your meme templates
- `public/assets.json` - All your logos and pfps

## Step 4: Test Your Site

```bash
npm run dev
```

Visit `http://localhost:3001` and your site will now load ALL your CDN images!

## 🎯 What This Achieves:

✅ **Dynamic Loading**: No more manual template lists
✅ **All Your Templates**: ~1000 memes available in editor
✅ **All Your Assets**: Logos and pfps in LZ Assets
✅ **Fast Performance**: JSON files are cached
✅ **Easy Updates**: Just re-run the script when you add files

## 🔧 Quick Test:

After running the script, check:
- `public/templates.json` exists and has your templates
- `public/assets.json` exists and has your assets
- Editor shows all your templates in 4x2 grid
- LZ Assets shows all your logos and pfps

**Your site will now use your entire CDN collection!** 🎉 