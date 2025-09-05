// Script to generate CDN manifest files
// Run this script: node generate-cdn-manifest.js

const fs = require('fs');
const path = require('path');

// CDN Base URL
const CDN_BASE_URL = "https://lzmeme.pages.dev";

// Test with common meme filenames - update these with your actual files
const memeFiles = [
  // Popular meme templates
  "distracted-boyfriend.jpg",
  "drake-pointing.jpg", 
  "surprised-pikachu.png",
  "this-is-fine.png",
  "woman-yelling-at-cat.jpg",
  "expanding-brain.jpg",
  "change-my-mind.jpg",
  "two-buttons.jpg",
  "running-away.jpg",
  "stonks.jpg",
  "galaxy-brain.jpg",
  "buff-doge.jpg",
  "crying-wojak.png",
  "pepe.png",
  "doge.png",
  "leonardo-dicaprio.jpg",
  "always-has-been.jpg",
  "among-us.png",
  "wojak.png",
  "chad.jpg"
];

const logoFiles = [
  "lz-logo.png",
  "lz-logo.webp", 
  "watermark.png",
  "logo.svg"
];

const pfpFiles = [
  "avatar-1.png",
  "avatar-2.png",
  "profile-pic.jpg",
  "sample-pfp.webp"
];

function generateTemplatesManifest() {
  const templates = memeFiles.map((filename, index) => {
    const name = filename.replace(/\.(webp|png|jpg|jpeg)$/i, '').replace(/[-_]/g, ' ');
    const category = categorizeTemplate(filename);
    const tags = generateTags(filename);
    
    return {
      id: `template-${index + 1}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      url: `${CDN_BASE_URL}/memes/${filename}`,
      category,
      tags,
      // Add fallback for testing
      fallback: `/templates/${filename.replace(/\.(webp|png|jpg|jpeg)$/i, '.svg')}`
    };
  });

  fs.writeFileSync(
    path.join(__dirname, 'public', 'templates.json'), 
    JSON.stringify(templates, null, 2)
  );
  
  return templates.length;
}

function generateAssetsManifest() {
  const logoAssets = logoFiles.map((filename, index) => ({
    id: `logo-${index + 1}`,
    name: filename.replace(/\.(webp|png|jpg|jpeg|svg)$/i, '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    url: `${CDN_BASE_URL}/logo/${filename}`,
    type: "logo",
    category: "branding",
    fallback: `/templates/logo-placeholder.svg`
  }));

  const pfpAssets = pfpFiles.map((filename, index) => ({
    id: `pfp-${index + 1}`,
    name: filename.replace(/\.(webp|png|jpg|jpeg)$/i, '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    url: `${CDN_BASE_URL}/pfps/${filename}`,
    type: "pfp", 
    category: "avatars",
    fallback: `/templates/avatar-placeholder.svg`
  }));

  const allAssets = [...logoAssets, ...pfpAssets];
  
  fs.writeFileSync(
    path.join(__dirname, 'public', 'assets.json'),
    JSON.stringify(allAssets, null, 2)
  );
  
  return allAssets.length;
}

function categorizeTemplate(filename) {
  const name = filename.toLowerCase();
  if (name.includes('boyfriend') || name.includes('girlfriend') || name.includes('relationship') || name.includes('distracted')) return 'relationship';
  if (name.includes('drake') || name.includes('pointing') || name.includes('reaction')) return 'reaction';
  if (name.includes('pikachu') || name.includes('pokemon') || name.includes('surprised')) return 'general';
  if (name.includes('fine') || name.includes('fire') || name.includes('dog')) return 'situation';
  if (name.includes('spiderman') || name.includes('spider')) return 'reaction';
  if (name.includes('woman') || name.includes('cat') || name.includes('yelling')) return 'argument';
  if (name.includes('brain') || name.includes('expanding') || name.includes('galaxy')) return 'intelligence';
  if (name.includes('change') || name.includes('mind')) return 'opinion';
  if (name.includes('stonks') || name.includes('money')) return 'finance';
  if (name.includes('among') || name.includes('sus')) return 'gaming';
  return 'general';
}

function generateTags(filename) {
  const name = filename.toLowerCase().replace(/\.(webp|png|jpg|jpeg)$/i, '');
  const words = name.split(/[-_\s]+/);
  
  // Add some common meme-related tags based on filename
  const tagMap = {
    'distracted': ['boyfriend', 'girlfriend', 'distracted', 'choice', 'looking'],
    'boyfriend': ['boyfriend', 'girlfriend', 'distracted', 'choice'],
    'drake': ['drake', 'pointing', 'approve', 'disapprove', 'no', 'yes'],
    'pikachu': ['pokemon', 'shocked', 'surprised', 'reaction'],
    'fine': ['dog', 'fire', 'calm', 'chaos', 'fine', 'everything'],
    'spiderman': ['spiderman', 'pointing', 'same', 'identical'],
    'woman': ['woman', 'cat', 'yelling', 'table', 'dinner'],
    'brain': ['brain', 'expanding', 'smart', 'intelligence', 'galaxy'],
    'change': ['change', 'mind', 'opinion', 'convince'],
    'stonks': ['stonks', 'stocks', 'money', 'finance', 'profit'],
    'among': ['among', 'us', 'sus', 'suspicious', 'gaming'],
    'wojak': ['wojak', 'sad', 'crying', 'feels', 'emotion'],
    'chad': ['chad', 'strong', 'confident', 'alpha'],
    'doge': ['doge', 'dog', 'shiba', 'wow', 'much']
  };
  
  for (const [key, tags] of Object.entries(tagMap)) {
    if (name.includes(key)) {
      return tags;
    }
  }
  
  return words.filter(word => word.length > 2);
}

// Main execution
console.log('🚀 Generating CDN manifest files...');

try {
  const templateCount = generateTemplatesManifest();
  console.log(`✅ Generated templates.json with ${templateCount} templates`);
  
  const assetCount = generateAssetsManifest();
  console.log(`✅ Generated assets.json with ${assetCount} assets`);
  
  console.log('✅ Done! Check public/templates.json and public/assets.json');
  console.log('\n📋 Next steps:');
  console.log('1. Make sure your R2 bucket is set to PUBLIC in Cloudflare Dashboard');
  console.log('2. Test CDN URLs in browser');
  console.log('3. Replace filenames in this script with your actual files');
  console.log('4. Your site will automatically load from CDN or use fallbacks!');
  
} catch (error) {
  console.error('❌ Error generating manifest files:', error);
} 