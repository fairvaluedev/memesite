"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { motion } from "framer-motion";
import { 
  Type, 
  Image, 
  Download, 
  Undo, 
  Upload,
  Bold,
  Italic,
  Search,
  Grid3x3
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { getTemplates, searchTemplates, Template, saveRecentMeme } from "@/lib/meme-storage";
import { getCDNAssets, searchCDNAssets, CDNAsset } from "@/lib/cdn-assets";

export default function EditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [username, setUsername] = useState("");
  // Removed unused selectedTool state
  const [textOptions, setTextOptions] = useState({
    fontSize: 32,
    fontFamily: "Arial",
    fill: "#000000",
    fontWeight: "normal" as "normal" | "bold",
    fontStyle: "normal" as "normal" | "italic",
    textAlign: "left" as "left" | "center" | "right"
  });
  
  // Template search state
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [showTemplates, setShowTemplates] = useState(true); // Expanded by default
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  
  // LZ Assets state
  const [showAssets, setShowAssets] = useState(false);
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [availableAssets, setAvailableAssets] = useState<CDNAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<CDNAsset[]>([]);
  
  // Layers state
  const [canvasObjects, setCanvasObjects] = useState<fabric.Object[]>([]);

  // Load templates on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const templates = await getTemplates();
        setAvailableTemplates(templates);
        setFilteredTemplates(templates.slice(0, 8)); // Show first 8 templates initially
        
        // Load CDN assets
        const assets = await getCDNAssets();
        setAvailableAssets(assets);
        setFilteredAssets(assets); // Show all assets initially
      } catch (error) {
        console.error('Error loading templates/assets:', error);
      }
    };
    
    loadData();
  }, []);

  // Handle template search
  useEffect(() => {
    if (templateSearchQuery.trim() === "") {
      setFilteredTemplates(availableTemplates.slice(0, 8));
    } else {
      const results = searchTemplates(templateSearchQuery, availableTemplates);
      setFilteredTemplates(results.slice(0, 8));
    }
  }, [templateSearchQuery, availableTemplates]);

  // Handle asset search
  useEffect(() => {
    if (assetSearchQuery.trim() === "") {
      setFilteredAssets(availableAssets);
    } else {
      const results = searchCDNAssets(assetSearchQuery, availableAssets);
      setFilteredAssets(results);
    }
  }, [assetSearchQuery, availableAssets]);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      // Initialize Fabric.js canvas
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
      });

      fabricCanvasRef.current = canvas;

      // Add default background
      const rect = new fabric.Rect({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        fill: "#f5f5f5",
        selectable: false,
        evented: false,
      });
      canvas.add(rect);
      canvas.sendToBack(rect);

      // Add event listener to maintain proper layering
      canvas.on('object:added', function(e: fabric.IEvent) {
        const obj = e.target;
        if (obj && (obj as fabric.Object & { isTemplate?: boolean }).isTemplate) {
          // Templates should always be above background but below other objects
          canvas.sendToBack(obj);
          canvas.bringForward(obj); // Move above background
        } else if (obj && !(obj as fabric.Object & { isTemplate?: boolean }).isTemplate && obj !== rect) {
          // All other objects (text, images, assets) should be above templates
          canvas.bringToFront(obj);
        }
      });

      // Add event listener to keep templates in background when moved
      canvas.on('object:moving', function(e: fabric.IEvent) {
        const obj = e.target;
        if (obj && (obj as fabric.Object & { isTemplate?: boolean }).isTemplate) {
          // When template is moved, ensure it stays in background layer
          canvas.sendToBack(obj);
          canvas.bringForward(obj); // Move above background
        }
      });

      // Add event listener to maintain layer order after any object modification
      canvas.on('object:modified', function(e: fabric.IEvent) {
        const obj = e.target;
        if (obj && (obj as fabric.Object & { isTemplate?: boolean }).isTemplate) {
          // After template is modified (moved, scaled, etc.), keep it in background
          canvas.sendToBack(obj);
          canvas.bringForward(obj); // Move above background
        } else if (obj && !(obj as fabric.Object & { isTemplate?: boolean }).isTemplate && obj !== rect) {
          // Ensure other objects stay above templates
          canvas.bringToFront(obj);
        }
        updateCanvasObjects();
      });

      // Add event listeners to track canvas changes for layers panel
      canvas.on('object:added', updateCanvasObjects);
      canvas.on('object:removed', updateCanvasObjects);
      canvas.on('object:moved', updateCanvasObjects);
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Add keyboard event listener for delete key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle delete if we're not editing text
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (fabricCanvasRef.current) {
          const activeObject = fabricCanvasRef.current.getActiveObject();
          
          // Check if we're editing text
          const isEditingText = activeObject && 
            (activeObject.type === 'i-text' || activeObject.type === 'text') && 
            (activeObject as fabric.IText).isEditing;
          
          // Only delete if we're not editing text
          if (activeObject && !isEditingText) {
            fabricCanvasRef.current.remove(activeObject);
            fabricCanvasRef.current.renderAll();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle template URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateUrl = urlParams.get('template');
    const templateName = urlParams.get('name');
    
    if (templateUrl && fabricCanvasRef.current) {
      console.log('Loading template from URL:', templateName, templateUrl);
      
      fabric.Image.fromURL(decodeURIComponent(templateUrl), (img: fabric.Image) => {
        if (!fabricCanvasRef.current) return;
        
        console.log('Template loaded successfully from URL:', templateName);
        
        // Calculate scale to fit the canvas nicely
        const canvasWidth = fabricCanvasRef.current.width || 800;
        const canvasHeight = fabricCanvasRef.current.height || 600;
        const maxWidth = canvasWidth * 0.8;
        const maxHeight = canvasHeight * 0.8;
        
        const scaleX = maxWidth / img.width;
        const scaleY = maxHeight / img.height;
        const scale = Math.min(scaleX, scaleY, 1);
        
        img.scale(scale);
        img.set({
          left: (canvasWidth - img.width * scale) / 2,
          top: (canvasHeight - img.height * scale) / 2,
          // Make template selectable but keep it as background layer
          selectable: true,
          evented: true,
          // Add a custom property to identify templates
          isTemplate: true
        });
        
        fabricCanvasRef.current.add(img);
        // Always send templates to back (behind background but above it)
        fabricCanvasRef.current.sendToBack(img);
        // Move it above the background rectangle
        fabricCanvasRef.current.bringForward(img);
        
        // Allow template to be selected for positioning
        fabricCanvasRef.current.setActiveObject(img);
      }, {
        crossOrigin: 'anonymous'
      });
    }
  }, []);

  // Function to update canvas objects list for layers panel
  const updateCanvasObjects = () => {
    if (fabricCanvasRef.current) {
      const objects = fabricCanvasRef.current.getObjects().filter(obj => obj !== fabricCanvasRef.current?.getObjects()[0]); // Exclude background
      setCanvasObjects(objects);
    }
  };

  // Function to select object from layers panel
  const selectObjectFromLayer = (object: fabric.Object) => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setActiveObject(object);
      fabricCanvasRef.current.renderAll();
    }
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;

    const text = new fabric.IText("Your text here", {
      left: 100,
      top: 100,
      fontSize: textOptions.fontSize,
      fontFamily: textOptions.fontFamily,
      fill: textOptions.fill,
      fontWeight: textOptions.fontWeight,
      fontStyle: textOptions.fontStyle,
      textAlign: textOptions.textAlign,
    });

    fabricCanvasRef.current.add(text);
    // Always bring text to front (above templates)
    fabricCanvasRef.current.bringToFront(text);
    fabricCanvasRef.current.setActiveObject(text);
    setSelectedTool(null);
  };

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !fabricCanvasRef.current) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        fabric.Image.fromURL(imgUrl, (img: fabric.Image) => {
          if (!fabricCanvasRef.current) return;
          
          img.scale(0.5);
          img.set({
            left: 50,
            top: 50,
          });
          
          fabricCanvasRef.current.add(img);
          // Always bring uploaded images to front (above templates)
          fabricCanvasRef.current.bringToFront(img);
          fabricCanvasRef.current.setActiveObject(img);
        }, {
          crossOrigin: 'anonymous'
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
    setSelectedTool(null);
  };

  const addTemplateToCanvas = (template: Template) => {
    if (!fabricCanvasRef.current) return;

    console.log('Loading template:', template.name, 'from URL:', template.url);

    fabric.Image.fromURL(template.url, (img: fabric.Image) => {
      if (!fabricCanvasRef.current) return;
      
      console.log('Template loaded successfully:', template.name);
      
      // Calculate scale to fit the canvas nicely
      const canvasWidth = fabricCanvasRef.current.width || 800;
      const canvasHeight = fabricCanvasRef.current.height || 600;
      const maxWidth = canvasWidth * 0.8; // Use 80% of canvas width
      const maxHeight = canvasHeight * 0.8; // Use 80% of canvas height
      
      const scaleX = maxWidth / img.width;
      const scaleY = maxHeight / img.height;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      
      img.scale(scale);
      img.set({
        left: (canvasWidth - img.width * scale) / 2,
        top: (canvasHeight - img.height * scale) / 2,
        // Make template selectable but keep it as background layer
        selectable: true,
        evented: true,
        // Add a custom property to identify templates
        isTemplate: true
      });
      
      fabricCanvasRef.current.add(img);
      // Always send templates to back (behind background but above it)
      fabricCanvasRef.current.sendToBack(img);
      // Move it above the background rectangle
      fabricCanvasRef.current.bringForward(img);
      
      // Allow template to be selected for positioning
      fabricCanvasRef.current.setActiveObject(img);
    }, {
      // Add crossOrigin attribute to handle CORS
      crossOrigin: 'anonymous'
    });
    
    setShowTemplates(false);
  };

  const addAssetToCanvas = (asset: CDNAsset) => {
    if (!fabricCanvasRef.current) return;

    fabric.Image.fromURL(asset.url, (img: fabric.Image) => {
      if (!fabricCanvasRef.current) return;
      
      // Scale assets smaller than templates (logos/pfps are typically smaller)
      const canvasWidth = fabricCanvasRef.current.width || 800;
      
      let scale = 0.2; // Default smaller scale for assets
      
      // Different scaling for different asset types
      if (asset.type === "logo") {
        scale = 0.15; // Smaller for logos
      } else if (asset.type === "pfp") {
        scale = 0.25; // Slightly larger for profile pictures
      }
      
      img.scale(scale);
      img.set({
        left: canvasWidth - (img.width * scale) - 20, // Position in top-right corner
        top: 20,
      });
      
      fabricCanvasRef.current.add(img);
      // Always bring assets to front (above templates)
      fabricCanvasRef.current.bringToFront(img);
      fabricCanvasRef.current.setActiveObject(img);
    }, {
      // Add crossOrigin attribute to handle CORS
      crossOrigin: 'anonymous'
    });
    
    setShowAssets(false);
  };

  const downloadMeme = () => {
    if (!fabricCanvasRef.current) return;

    const dataURL = fabricCanvasRef.current.toDataURL({
      format: "png",
      quality: 1,
    });

    // Save to recent memes
    const creatorName = username.trim() || "Anonymous";
    saveRecentMeme({
      imageUrl: dataURL,
      creator: creatorName,
      title: `Meme by ${creatorName}`
    });

    // Download the meme
    const link = document.createElement("a");
    link.download = `meme-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  const undo = () => {
    // Simplified undo - remove last object
    if (!fabricCanvasRef.current) return;
    const objects = fabricCanvasRef.current.getObjects();
    if (objects.length > 1) { // Keep background
      fabricCanvasRef.current.remove(objects[objects.length - 1]);
    }
  };

  const updateTextStyle = (property: string, value: string | number) => {
    if (!fabricCanvasRef.current) return;
    
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      (activeObject as fabric.IText).set(property as keyof fabric.IText, value);
      fabricCanvasRef.current.renderAll();
    }
    
    setTextOptions(prev => ({ ...prev, [property]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold hover:text-foreground/80 transition-colors">
              LZ Meme Generator
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/gallery" className="text-muted-foreground hover:text-foreground transition-colors">
                Gallery
              </Link>
              <Link href="/lzindex" className="text-muted-foreground hover:text-foreground transition-colors">
                LZIndex
              </Link>
            </nav>
            <span className="text-muted-foreground">Editor</span>
          </div>
          
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Layers Panel */}
      {canvasObjects.length > 0 && (
        <div className="border-b border-border bg-muted/50 p-4">
          <div className="container mx-auto">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Layers</h3>
            <div className="flex gap-2 flex-wrap">
              {canvasObjects.map((obj, index) => (
                <button
                  key={index}
                  onClick={() => selectObjectFromLayer(obj)}
                  className={`w-12 h-8 rounded border-2 transition-all hover:scale-105 ${
                    fabricCanvasRef.current?.getActiveObject() === obj
                      ? 'border-foreground ring-2 ring-foreground/20'
                      : 'border-border hover:border-foreground/50'
                  }`}
                >
                  {obj.type === 'i-text' ? (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-bold">
                      T
                    </div>
                  ) : obj.type === 'image' ? (
                    <img
                      src={obj.getSrc()}
                      alt="Layer"
                      className="w-full h-full object-cover rounded"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs">
                      ?
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar Tools */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 border-r border-border bg-background p-6 h-[calc(100vh-73px)] overflow-y-auto"
        >
          <h3 className="text-lg font-semibold mb-6">Tools</h3>
          
          {/* Main Tools */}
          <div className="space-y-3 mb-8">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="w-full btn-primary justify-start gap-3"
            >
              <Grid3x3 className="w-5 h-5" />
              Choose Meme
            </button>
            
            <button
              onClick={addText}
              className="w-full btn-secondary justify-start gap-3"
            >
              <Type className="w-5 h-5" />
              Add Text
            </button>
            
            <button
              onClick={addImage}
              className="w-full btn-secondary justify-start gap-3"
            >
              <Upload className="w-5 h-5" />
              Upload Image
            </button>
            
            <button
              onClick={() => setShowAssets(!showAssets)}
              className="w-full btn-secondary justify-start gap-3"
            >
              <Image className="w-5 h-5" />
              LZ Assets
            </button>
          </div>

          {/* Template Search and Grid */}
          {showTemplates && (
            <div className="space-y-4 mb-8">
                             <h4 className="font-medium">Choose Meme Template</h4>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--color-muted-foreground))' }} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'rgb(var(--color-muted))',
                    borderColor: 'rgb(var(--color-border))',
                    color: 'rgb(var(--color-foreground))'
                  }}
                />
              </div>

              {/* Templates Grid (4x2) */}
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {filteredTemplates.map((template) => (
                  <motion.button
                    key={template.id}
                    onClick={() => addTemplateToCanvas(template)}
                    className="aspect-square rounded-lg overflow-hidden border hover:scale-105 transition-transform duration-200"
                    style={{
                      borderColor: 'rgb(var(--color-border))'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={template.url}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      title={template.name}
                    />
                  </motion.button>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <p className="text-center py-4" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                  No templates found
                </p>
              )}
            </div>
          )}

          {/* LZ Assets Section */}
          {showAssets && (
            <div className="space-y-4 mb-8">
              <h4 className="font-medium">LZ Assets</h4>
              
              {/* Asset Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--color-muted-foreground))' }} />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={assetSearchQuery}
                  onChange={(e) => setAssetSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'rgb(var(--color-muted))',
                    borderColor: 'rgb(var(--color-border))',
                    color: 'rgb(var(--color-foreground))'
                  }}
                />
              </div>

              {/* Assets by Category */}
              <div className="space-y-4">
                {/* Logos Section */}
                {filteredAssets.filter(asset => asset.type === "logo").length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                      Logos
                    </h5>
                    <div className="grid grid-cols-3 gap-2">
                      {filteredAssets.filter(asset => asset.type === "logo").map((asset) => (
                        <motion.button
                          key={asset.id}
                          onClick={() => addAssetToCanvas(asset)}
                          className="aspect-square rounded-lg overflow-hidden border hover:scale-105 transition-transform duration-200 bg-muted"
                          style={{
                            borderColor: 'rgb(var(--color-border))'
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-contain p-1"
                            title={asset.name}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PFPs Section */}
                {filteredAssets.filter(asset => asset.type === "pfp").length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                      Profile Pictures
                    </h5>
                    <div className="grid grid-cols-3 gap-2">
                      {filteredAssets.filter(asset => asset.type === "pfp").map((asset) => (
                        <motion.button
                          key={asset.id}
                          onClick={() => addAssetToCanvas(asset)}
                          className="aspect-square rounded-lg overflow-hidden border hover:scale-105 transition-transform duration-200"
                          style={{
                            borderColor: 'rgb(var(--color-border))'
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                            title={asset.name}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {filteredAssets.length === 0 && (
                <p className="text-center py-4" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                  No assets found
                </p>
              )}
            </div>
          )}

          {/* Text Styling */}
          <div className="space-y-4 mb-8">
            <h4 className="font-medium">Text Style</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-muted-foreground">Size</label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={textOptions.fontSize}
                  onChange={(e) => updateTextStyle("fontSize", parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs">{textOptions.fontSize}px</span>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Color</label>
                <input
                  type="color"
                  value={textOptions.fill}
                  onChange={(e) => updateTextStyle("fill", e.target.value)}
                  className="w-full h-8 rounded border border-border"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateTextStyle("fontWeight", 
                  textOptions.fontWeight === "bold" ? "normal" : "bold")}
                className={`p-2 rounded border border-border ${
                  textOptions.fontWeight === "bold" ? "bg-foreground text-background" : "bg-muted"
                }`}
              >
                <Bold className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => updateTextStyle("fontStyle", 
                  textOptions.fontStyle === "italic" ? "normal" : "italic")}
                className={`p-2 rounded border border-border ${
                  textOptions.fontStyle === "italic" ? "bg-foreground text-background" : "bg-muted"
                }`}
              >
                <Italic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={undo}
              className="w-full btn-secondary justify-start gap-3"
            >
              <Undo className="w-5 h-5" />
              Undo
            </button>
            
            <button
              onClick={downloadMeme}
              className="w-full btn-primary justify-start gap-3"
            >
              <Download className="w-5 h-5" />
              Download Meme
            </button>
          </div>
        </motion.aside>

        {/* Canvas Area */}
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center h-[calc(100vh-73px-3rem)]"
          >
            <div className="border border-border rounded-lg overflow-hidden shadow-lg">
              <canvas ref={canvasRef} />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 