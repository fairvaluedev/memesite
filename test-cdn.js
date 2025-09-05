const https = require('https');

// Test CDN URLs
const testUrls = [
  'https://lzmeme.pages.dev/memes/2%20wolves.webp',
  'https://lzmeme.pages.dev/logo/LayerZero_emblem.png',
  'https://lzmeme.pages.dev/pfps/'
];

function testUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      console.log(`✅ ${url} - Status: ${response.statusCode}`);
      resolve({ url, status: response.statusCode, success: response.statusCode === 200 });
    });
    
    request.on('error', (error) => {
      console.log(`❌ ${url} - Error: ${error.message}`);
      resolve({ url, error: error.message, success: false });
    });
    
    request.setTimeout(5000, () => {
      console.log(`⏰ ${url} - Timeout`);
      request.destroy();
      resolve({ url, error: 'Timeout', success: false });
    });
  });
}

async function testCDN() {
  console.log('🧪 Testing CDN URLs...\n');
  
  for (const url of testUrls) {
    await testUrl(url);
  }
  
  console.log('\n📋 If you see 200 status codes, your CDN is working!');
  console.log('📋 If you see errors, your R2 bucket needs to be made public.');
}

testCDN(); 