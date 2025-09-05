"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LZIndexPage() {
  // Single image as requested
  const lzImages = [
    {
      id: 1,
      url: "https://lzmeme.pages.dev/memes/underc.png",
      title: "Underc",
      description: ""
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold hover:text-foreground/80 transition-colors">
              LZ Meme Generator
            </Link>
            <span className="text-2xl font-bold">LZIndex</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold">LZIndex</h1>
        </motion.div>

        {/* Centered Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center items-center min-h-[60vh]"
        >
          <div className="relative w-full max-w-4xl">
            <img
              src={lzImages[0].url}
              alt={lzImages[0].title}
              className="w-full h-auto object-contain rounded-lg shadow-lg"
              loading="lazy"
            />
          </div>
        </motion.div>

        {/* Empty State */}
        {lzImages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground text-lg">
              No images available yet. Check back later!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
