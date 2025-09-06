import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' for Vercel deployment
  // Vercel handles static generation automatically
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Vercel will automatically optimize images
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
