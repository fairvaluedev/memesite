export interface Meme {
  id: string;
  imageUrl: string;
  creator: string;
  createdAt: Date;
  title?: string;
}

export interface Template {
  id: string;
  name: string;
  url: string;
  category: string;
  tags?: string[];
}

// Local storage keys
const RECENT_MEMES_KEY = "lz-recent-memes";
const TEMPLATE_FAVORITES_KEY = "lz-favorite-templates";

// Cache for loaded templates
let cachedTemplates: Template[] | null = null;

// Meme storage functions
export function saveRecentMeme(meme: Omit<Meme, "id" | "createdAt">): void {
  if (typeof window === "undefined") return;
  
  try {
    const recentMemes = getRecentMemes();
    const newMeme: Meme = {
      ...meme,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    // Add to beginning and limit to 10 recent memes
    const updatedMemes = [newMeme, ...recentMemes.slice(0, 9)];
    
    localStorage.setItem(RECENT_MEMES_KEY, JSON.stringify(updatedMemes));
  } catch (error) {
    console.error("Failed to save recent meme:", error);
  }
}

export function getRecentMemes(): Meme[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(RECENT_MEMES_KEY);
    if (!stored) return [];
    
    const memes = JSON.parse(stored);
    return memes.map((meme: any) => ({
      ...meme,
      createdAt: new Date(meme.createdAt),
    }));
  } catch (error) {
    console.error("Failed to get recent memes:", error);
    return [];
  }
}

// Load templates from JSON file
async function loadTemplatesFromJSON(): Promise<Template[]> {
  try {
    console.log('Fetching templates.json...');
    const response = await fetch('/templates.json');
    console.log('Response status:', response.status, response.ok);
    if (!response.ok) {
      console.warn('templates.json not found, using fallback templates');
      return getFallbackTemplates();
    }
    const templates = await response.json();
    console.log('Parsed templates from JSON:', templates);
    
    // Test CDN accessibility and use actual CDN URLs
    console.log('Testing CDN URLs and using them directly');
    
    // Use the actual CDN URLs from templates.json
    return templates;
  } catch (error) {
    console.error('Error loading templates:', error);
    return getFallbackTemplates();
  }
}

// Fallback templates if JSON file doesn't exist yet
function getFallbackTemplates(): Template[] {
  return [
    { 
      id: "1", 
      name: "Surprised Pikachu", 
      url: "/templates/surprised-pikachu.png", 
      category: "reaction",
      tags: ["pokemon", "shocked", "surprised", "reaction"]
    },
    { 
      id: "2", 
      name: "This is Fine", 
      url: "/templates/this-is-fine.jpg", 
      category: "situation",
      tags: ["dog", "fire", "calm", "chaos", "fine"]
    },
    { 
      id: "3", 
      name: "Spider-Man Pointing", 
      url: "/templates/spiderman-pointing.png", 
      category: "pointing",
      tags: ["spiderman", "pointing", "same", "identical"]
    },
    { 
      id: "4", 
      name: "Woman Yelling at Cat", 
      url: "/templates/woman-yelling-cat.jpg", 
      category: "argument",
      tags: ["woman", "cat", "yelling", "table", "dinner"]
    },
  ];
}

// Template functions
export async function getTemplates(): Promise<Template[]> {
  if (cachedTemplates) {
    return cachedTemplates;
  }
  
  cachedTemplates = await loadTemplatesFromJSON();
  return cachedTemplates;
}

export function searchTemplates(query: string, templates: Template[]): Template[] {
  if (!query) return templates;
  
  const lowercaseQuery = query.toLowerCase();
  return templates.filter(template =>
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.category.toLowerCase().includes(lowercaseQuery) ||
    template.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

// Favorites (for future use)
export function getFavoriteTemplates(): string[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(TEMPLATE_FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to get favorite templates:", error);
    return [];
  }
}

export function toggleFavoriteTemplate(templateId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const favorites = getFavoriteTemplates();
    const updatedFavorites = favorites.includes(templateId)
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];
    
    localStorage.setItem(TEMPLATE_FAVORITES_KEY, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error("Failed to toggle favorite template:", error);
  }
} 