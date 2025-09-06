"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Grid, List, Filter, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import Fuse from "fuse.js";

import { getTemplates, Template } from "@/lib/meme-storage";

const categories = ["all", "reaction", "relationship", "argument", "situation", "evolution", "opinion", "pointing"];

export default function GalleryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [templates, setTemplates] = useState<Template[]>([]);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const loadedTemplates = await getTemplates();
        setTemplates(loadedTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };
    
    loadTemplates();
  }, []);

  // Initialize Fuse for fuzzy search
  const fuse = useMemo(() => new Fuse(templates, {
    keys: ["name", "category"],
    threshold: 0.3,
  }), [templates]);

  // Filter and search templates
  const filteredTemplates = useMemo(() => {
    let templateList = templates;

    // Filter by category
    if (selectedCategory !== "all") {
      templateList = templateList.filter(template => template.category === selectedCategory);
    }

    // Search
    if (searchTerm) {
      const searchResults = fuse.search(searchTerm);
      templateList = searchResults.map(result => result.item);
    }

    return templateList;
  }, [searchTerm, selectedCategory, templates, fuse]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold hover:text-foreground/80 transition-colors">
              LZ Meme Generator
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/editor" className="text-muted-foreground hover:text-foreground transition-colors">
                Editor
              </Link>
              <Link href="/lzindex" className="text-muted-foreground hover:text-foreground transition-colors">
                LZIndex
              </Link>
            </nav>
            <span className="text-muted-foreground">Templates</span>
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

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3 transition-colors ${
                viewMode === "grid" ? "bg-foreground text-background" : "bg-muted hover:bg-muted/80"
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3 transition-colors ${
                viewMode === "list" ? "bg-foreground text-background" : "bg-muted hover:bg-muted/80"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Templates Grid/List */}
        <motion.div
          layout
          className={`${
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
              : "space-y-4"
          }`}
        >
          {filteredTemplates.map((template, index) => (
            <Link key={template.id} href={`/editor?template=${encodeURIComponent(template.url)}&name=${encodeURIComponent(template.name)}`}>
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`${
                  viewMode === "grid" 
                    ? "group cursor-pointer" 
                    : "flex gap-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                }`}
              >
              {viewMode === "grid" ? (
                <div className="space-y-3">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border group-hover:scale-105 transition-transform duration-200">
                    <img
                      src={template.url}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                      <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Use Template
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium group-hover:text-foreground/80 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {template.category}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                    <img
                      src={template.url}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {template.category}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or category filter
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
} 