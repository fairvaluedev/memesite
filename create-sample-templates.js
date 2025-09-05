const fs = require('fs');
const path = require('path');

// Create sample template images as SVGs for the most common memes
const sampleTemplates = [
  { name: '2-wolves', text: '2 Wolves\nMeme Template' },
  { name: 'distracted-boyfriend', text: 'Distracted Boyfriend\nMeme Template' },
  { name: 'drake-pointing', text: 'Drake Pointing\nMeme Template' },
  { name: 'surprised-pikachu', text: 'Surprised Pikachu\nMeme Template' },
  { name: 'this-is-fine', text: 'This Is Fine\nMeme Template' },
  { name: 'woman-yelling-at-cat', text: 'Woman Yelling at Cat\nMeme Template' },
  { name: 'expanding-brain', text: 'Expanding Brain\nMeme Template' },
  { name: 'change-my-mind', text: 'Change My Mind\nMeme Template' },
  { name: 'always-has-been', text: 'Always Has Been\nMeme Template' },
  { name: 'stonks', text: 'Stonks\nMeme Template' }
];

function createSVGTemplate(text, width = 400, height = 300, bgColor = '#f8f9fa') {
  const lines = text.split('\n');
  const lineHeight = 24;
  const startY = height / 2 - (lines.length * lineHeight) / 2;
  
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}" stroke="#dee2e6" stroke-width="2" rx="8"/>
  <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="none" stroke="#6c757d" stroke-width="1" stroke-dasharray="5,5" rx="4"/>
  ${lines.map((line, i) => 
    `<text x="50%" y="${startY + i * lineHeight}" text-anchor="middle" 
           font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#495057">${line}</text>`
  ).join('')}
  <text x="50%" y="${height - 20}" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="12" fill="#6c757d">Template Preview</text>
</svg>`.trim();
}

// Create templates directory if it doesn't exist
const templatesDir = path.join(__dirname, 'public', 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Generate sample templates
console.log('🎨 Creating sample template images...');

sampleTemplates.forEach(({ name, text }) => {
  const filePath = path.join(templatesDir, `${name}.svg`);
  const svg = createSVGTemplate(text);
  
  try {
    fs.writeFileSync(filePath, svg);
    console.log(`✅ Created: ${name}.svg`);
  } catch (error) {
    console.error(`❌ Failed to create ${name}.svg:`, error.message);
  }
});

console.log('\n🎉 Sample templates created!');
console.log('📋 Now your meme generator will show template previews while we fix the CDN.');
console.log('📋 Visit your editor to see the templates working!'); 