const fs = require('fs');
const path = require('path');

// CDN Base URL
const CDN_BASE_URL = "https://lzmeme.pages.dev";

// Local folder paths
const LOCAL_PATHS = {
  memes: "C:\\Users\\Hamza\\Documents\\mtf",
  logos: "C:\\Users\\Hamza\\Downloads\\logo", 
  pfps: "C:\\Users\\Hamza\\Downloads\\pfps"
};

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

function scanFolder(folderPath) {
  try {
    if (!fs.existsSync(folderPath)) {
      console.warn(`⚠️  Folder not found: ${folderPath}`);
      return [];
    }
    
    const files = fs.readdirSync(folderPath);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    });
    
    console.log(`📁 Found ${imageFiles.length} images in: ${folderPath}`);
    
    // Show extension breakdown
    const extensionCount = {};
    imageFiles.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      extensionCount[ext] = (extensionCount[ext] || 0) + 1;
    });
    console.log(`   Extensions: ${Object.entries(extensionCount).map(([ext, count]) => `${ext}(${count})`).join(', ')}`);
    
    return imageFiles;
  } catch (error) {
    console.error(`❌ Error scanning folder ${folderPath}:`, error.message);
    return [];
  }
}

function generateTemplatesManifest() {
  console.log('🔍 Scanning memes folder...');
  const memeFiles = scanFolder(LOCAL_PATHS.memes);
  
  if (memeFiles.length === 0) {
    console.warn('⚠️  No meme files found! Check the path.');
    return 0;
  }
  
  const templates = memeFiles.map((filename, index) => {
    const name = path.parse(filename).name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    const category = categorizeTemplate(filename);
    const tags = generateTags(filename);
    
    // For memes, convert local extension to .webp for CDN
    const baseName = path.parse(filename).name;
    const cdnFilename = `${baseName}.webp`;
    
    return {
      id: `template-${index + 1}`,
      name: name,
      url: `${CDN_BASE_URL}/memes/${encodeURIComponent(cdnFilename)}`,
      category,
      tags,
      fallback: `/templates/${path.parse(filename).name.toLowerCase().replace(/\s+/g, '-')}.svg`
    };
  });

  fs.writeFileSync(
    path.join(__dirname, 'public', 'templates.json'), 
    JSON.stringify(templates, null, 2)
  );
  
  return templates.length;
}

function generateAssetsManifest() {
  console.log('🔍 Scanning logo and pfps folders...');
  const logoFiles = scanFolder(LOCAL_PATHS.logos);
  const pfpFiles = scanFolder(LOCAL_PATHS.pfps);
  
  // For logos and pfps, keep the original extensions (svg, png, jpg)
  const logoAssets = logoFiles.map((filename, index) => ({
    id: `logo-${index + 1}`,
    name: path.parse(filename).name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()),
    url: `${CDN_BASE_URL}/logo/${encodeURIComponent(filename)}`, // Keep original extension + encode
    type: "logo",
    category: "branding",
    fallback: `/templates/logo-placeholder.svg`
  }));

  const pfpAssets = pfpFiles.map((filename, index) => ({
    id: `pfp-${index + 1}`,
    name: path.parse(filename).name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()),
    url: `${CDN_BASE_URL}/pfps/${encodeURIComponent(filename)}`, // Keep original extension + encode
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
  if (name.includes('wojak') || name.includes('cry') || name.includes('sad')) return 'emotion';
  if (name.includes('chad') || name.includes('strong')) return 'character';
  if (name.includes('doge') || name.includes('shiba')) return 'animal';
  return 'general';
}

function generateTags(filename) {
  const name = path.parse(filename).name.toLowerCase();
  const words = name.split(/[-_\s]+/).filter(word => word.length > 2);
  
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
    'doge': ['doge', 'dog', 'shiba', 'wow', 'much'],
    'pepe': ['pepe', 'frog', 'green', 'meme'],
    'leonardo': ['leonardo', 'dicaprio', 'pointing', 'actor'],
    'spongebob': ['spongebob', 'cartoon', 'yellow', 'underwater']
  };
  
  for (const [key, tags] of Object.entries(tagMap)) {
    if (name.includes(key)) {
      return tags;
    }
  }
  
  return words;
}

// Main execution
console.log('🚀 Scanning local folders and generating CDN manifest files...');
console.log('📂 Local paths:');
console.log(`   Memes: ${LOCAL_PATHS.memes}`);
console.log(`   Logos: ${LOCAL_PATHS.logos}`);
console.log(`   PFPs:  ${LOCAL_PATHS.pfps}`);
console.log('');

try {
  const templateCount = generateTemplatesManifest();
  console.log(`✅ Generated templates.json with ${templateCount} templates`);
  
  const assetCount = generateAssetsManifest();
  console.log(`✅ Generated assets.json with ${assetCount} assets`);
  
  console.log('✅ Done! Your site now has all your actual files!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Check public/templates.json and public/assets.json');
  console.log('2. Visit your site - all your memes should now load!');
  console.log('3. CDN URLs will be tried first, with fallbacks if needed');
  
} catch (error) {
  console.error('❌ Error generating manifest files:', error);
} 