// CDN Base URL
const CDN_BASE_URL = "https://lzmeme.pages.dev";

// Curated memes from your CDN to show on landing page initially
// Starting empty as requested - will show user-created memes instead
export const curatedMemes: Array<{
  id: string;
  url: string;
  creator: string;
  title: string;
}> = []; 