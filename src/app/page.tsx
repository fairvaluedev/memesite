"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Play, Image, Search } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

// Removed unused import: curatedMemes

// Slideshow images from ss folder - moved outside component to prevent recreation
const slideshowImages = [
  {
    id: "slide-1",
    url: "https://lzmeme.pages.dev/ss/Gz7SkvwWoAAeX5q.jpg",
    creator: "LZ Community",
    title: "Featured Meme 1"
  },
  {
    id: "slide-2", 
    url: "https://lzmeme.pages.dev/ss/GXnQb-eXwAAcbdS.jpg",
    creator: "LZ Community",
    title: "Featured Meme 2"
  },
  {
    id: "slide-3",
    url: "https://lzmeme.pages.dev/ss/GXnQUReW0AAfKyS.jpg", 
    creator: "LZ Community",
    title: "Featured Meme 3"
  },
  {
    id: "slide-4",
    url: "https://lzmeme.pages.dev/ss/GaXLwkNXUAAsg3M.jpg",
    creator: "LZ Community", 
    title: "Featured Meme 4"
  },
  {
    id: "slide-5",
    url: "https://lzmeme.pages.dev/ss/GvFPDOXWQAAWw59.jpg",
    creator: "LZ Community",
    title: "Featured Meme 5"
  },
  {
    id: "slide-6",
    url: "https://lzmeme.pages.dev/ss/GyzXELLWQAAxCSf.jpg",
    creator: "LZ Community",
    title: "Featured Meme 6"
  },
  {
    id: "slide-7",
    url: "https://lzmeme.pages.dev/ss/Gy0V-pmWEAI1rJx.png",
    creator: "LZ Community",
    title: "Featured Meme 7"
  },
  {
    id: "slide-8",
    url: "https://lzmeme.pages.dev/ss/dima.png",
    creator: "LZ Community",
    title: "Featured Meme 8"
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayMemes, setDisplayMemes] = useState(slideshowImages);

  // Always show slideshow images - no user created memes
  useEffect(() => {
    console.log('Setting display memes:', slideshowImages);
    setDisplayMemes(slideshowImages);
  }, []); // Empty dependency array since slideshowImages is now constant

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % displayMemes.length;
        console.log(`Slideshow: ${prev} -> ${next} (total: ${displayMemes.length})`);
        return next;
      });
    }, 2000); // Changed to 2 seconds

    return () => clearInterval(timer);
  }, [displayMemes.length]); // Added dependency to ensure it updates when displayMemes changes

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold"
              style={{ color: 'rgb(var(--color-foreground))' }}
            >
              LZ Meme Generator
            </motion.h1>
            <Link href="/lzindex" className="text-2xl font-bold hover:text-foreground/80 transition-colors">
              LZIndex
            </Link>
          </div>
          
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: 'rgb(var(--color-foreground))' }}>
              Create Epic
              <br />
              <span style={{ color: 'rgb(var(--color-foreground) / 0.7)' }}>Memes</span>
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              minimal meme generator with thousands of templates. 
              Add text, images, and custom lz assets.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/editor" className="btn-primary inline-flex items-center gap-2">
              <Play className="w-5 h-5" />
              Create Meme
            </Link>
            <Link href="/gallery" className="btn-secondary inline-flex items-center gap-2">
              <Image className="w-5 h-5" alt="" />
              Browse Templates
            </Link>
            <Link href="/lzindex" className="btn-secondary inline-flex items-center gap-2">
              <Image className="w-5 h-5" alt="" />
              LZIndex
            </Link>
          </motion.div>
        </section>

        {/* Slideshow Section */}
        <section className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-3xl font-bold text-center mb-8">Memes</h3>
            
            <div className="relative max-w-4xl mx-auto">
              {displayMemes.length > 0 ? (
                <>
                  {/* Slideshow Container */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted border border-border">
                    {displayMemes.map((meme, index) => (
                      <motion.div
                        key={meme.id}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: index === currentSlide ? 1 : 0,
                          scale: index === currentSlide ? 1 : 1.1
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <img
                          src={meme.url}
                          alt={meme.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            console.error(`Failed to load image: ${meme.url}`);
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log(`Successfully loaded image: ${meme.url}`);
                          }}
                        />
                        
                        {/* Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                          <p className="text-white font-medium">
                            Created by: {meme.creator}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Slide Indicators */}
                  <div className="flex justify-center mt-6 gap-2">
                    {displayMemes.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentSlide 
                            ? "bg-foreground" 
                            : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted border border-border border-dashed flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" alt="" />
                    <h4 className="text-xl font-semibold mb-2">No Memes Yet</h4>
                    <p className="text-muted-foreground mb-4">
                      Create your first meme to see it featured here!
                    </p>
                    <Link href="/editor" className="btn-primary inline-flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Create First Meme
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Easy Creation</h4>
              <p className="text-muted-foreground">
                Drag, drop, and edit with our intuitive canvas editor
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8" alt="" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Huge Library</h4>
              <p className="text-muted-foreground">
                Thousands of templates and custom LZ assets
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Smart Search</h4>
              <p className="text-muted-foreground">
                Find the perfect template with fuzzy search
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-muted-foreground">
            Made with ❤️ for lz community
          </p>
        </div>
      </footer>
    </div>
  );
}
