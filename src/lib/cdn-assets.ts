// CDN Configuration
const CDN_BASE_URL = "https://lzmeme.pages.dev";

export interface CDNAsset {
  id: string;
  name: string;
  url: string;
  type: "logo" | "pfp";
  category: string;
}

// Cache for loaded assets
let cachedAssets: CDNAsset[] | null = null;

// Load assets from JSON file
async function loadAssetsFromJSON(): Promise<CDNAsset[]> {
  try {
    console.log('Fetching assets.json...');
    const response = await fetch('/assets.json');
    console.log('Assets response status:', response.status, response.ok);
    if (!response.ok) {
      console.warn('assets.json not found, using fallback assets');
      return getFallbackAssets();
    }
    const assets = await response.json();
    console.log('Parsed assets from JSON:', assets);
    
    // Use CDN URLs directly - they should work now
    console.log('Using CDN URLs directly from assets.json');
    return assets;
  } catch (error) {
    console.error('Error loading assets:', error);
    return getFallbackAssets();
  }
}

// Fallback assets if JSON file doesn't exist yet
function getFallbackAssets(): CDNAsset[] {
  return [
    {
      id: "logo-1",
      name: "LZ Logo",
      url: `${CDN_BASE_URL}/assets/lz_logo.webp`,
      type: "logo",
      category: "branding"
    },
    {
      id: "pfp-1",
      name: "Sample Avatar",
      url: `${CDN_BASE_URL}/pfps/sample.webp`,
      type: "pfp", 
      category: "avatars"
    },
  ];
}

// Get all CDN assets
export async function getCDNAssets(): Promise<CDNAsset[]> {
  if (cachedAssets) {
    return cachedAssets;
  }
  
  cachedAssets = await loadAssetsFromJSON();
  return cachedAssets;
}

// Get assets by type
export function getAssetsByType(assets: CDNAsset[], type: "logo" | "pfp"): CDNAsset[] {
  return assets.filter(asset => asset.type === type);
}

// Search assets
export function searchCDNAssets(query: string, assets: CDNAsset[] = []): CDNAsset[] {
  if (!query.trim()) return assets;
  
  const lowercaseQuery = query.toLowerCase();
  return assets.filter(asset =>
    asset.name.toLowerCase().includes(lowercaseQuery) ||
    asset.type.toLowerCase().includes(lowercaseQuery) ||
    asset.category.toLowerCase().includes(lowercaseQuery)
  );
} 