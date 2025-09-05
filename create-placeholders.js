const fs = require('fs');
const path = require('path');

// Create simple text-based placeholders for missing templates
const placeholders = [
  { name: 'boyfriend.png', text: 'Distracted Boyfriend\nMeme Template' },
  { name: 'drake.png', text: 'Drake Pointing\nMeme Template' },
  { name: 'pikachu.png', text: 'Surprised Pikachu\nMeme Template' },
  { name: 'logo-placeholder.png', text: 'LZ Logo\nPlaceholder' },
  { name: 'avatar-placeholder.png', text: 'Avatar\nPlaceholder' }
];

// Create simple SVG placeholders
function createSVGPlaceholder(text, width = 400, height = 300) {
  const lines = text.split('\n');
  const lineHeight = 30;
  const startY = height / 2 - (lines.length * lineHeight) / 2;
  
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
  ${lines.map((line, i) => 
    `<text x="50%" y="${startY + i * lineHeight}" text-anchor="middle" 
           font-family="Arial, sans-serif" font-size="18" fill="#6b7280">${line}</text>`
  ).join('')}
</svg>`.trim();
}

// Create placeholder directory if it doesn't exist
const templatesDir = path.join(__dirname, 'public', 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Generate placeholders
placeholders.forEach(({ name, text }) => {
  const filePath = path.join(templatesDir, name.replace('.png', '.svg'));
  const svg = createSVGPlaceholder(text);
  
  try {
    fs.writeFileSync(filePath, svg);
    console.log(`✅ Created placeholder: ${name.replace('.png', '.svg')}`);
  } catch (error) {
    console.error(`❌ Failed to create ${name}:`, error);
  }
});

console.log('\n🎉 Placeholder images created!');
console.log('📋 These will be used as fallbacks when CDN images fail to load.'); 