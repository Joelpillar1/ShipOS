import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { faqSchema, breadcrumbSchema, softwareApplicationSchema } from "@/lib/seo";
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles,
  TrendingUp,
  Check,
  ArrowRight,
  Info,
  Upload,
  Download,
  Scissors,
  Grid,
  RefreshCw
} from "lucide-react";

const SectionBadge = ({ label, text }: { label: string; text: string }) => (
  <div className="inline-flex items-center gap-2 border border-[#d75a34]/60 rounded-full p-1 pr-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm shadow-sm mb-6">
    <div className="bg-gradient-to-b from-[#e36e4b] to-[#d75a34] text-white text-[13px] font-bold px-3 py-1 rounded-full shadow-inner">
      {label}
    </div>
    <span className="text-[13px] font-semibold text-gray-800 dark:text-neutral-200 tracking-wide">
      {text}
    </span>
  </div>
);

interface SlicedTile {
  index: number;
  dataUrl: string;
  row: number;
  col: number;
}

export default function InstagramGridMaker() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // File states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [gridRows, setGridRows] = useState<number>(3); // default 3x3
  const [slicedTiles, setSlicedTiles] = useState<SlicedTile[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accordion indices
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
      setImageSrc(URL.createObjectURL(file));
      setImageName(file.name.replace(/\.[^/.]+$/, ""));
      setSlicedTiles([]); // clear previous slices
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSplitGrid = () => {
    if (!imageSrc) return;
    
    setIsProcessing(true);
    const img = new Image();
    img.onload = () => {
      try {
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        const cols = 3;
        const rows = gridRows;
        
        const sliceWidth = imgWidth / cols;
        const sliceHeight = imgHeight / rows;
        
        const targetPanelSize = 1080;
        const newTiles: SlicedTile[] = [];
        
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const canvas = document.createElement("canvas");
            canvas.width = targetPanelSize;
            canvas.height = targetPanelSize;
            const ctx = canvas.getContext("2d");
            
            if (ctx) {
              const sx = c * sliceWidth;
              const sy = r * sliceHeight;
              const sw = sliceWidth;
              const sh = sliceHeight;
              
              let cropX = sx;
              let cropY = sy;
              let cropWidth = sw;
              let cropHeight = sh;
              
              if (sw > sh) {
                cropWidth = sh;
                cropX = sx + (sw - sh) / 2;
              } else if (sw < sh) {
                cropHeight = sw;
                cropY = sy + (sh - sw) / 2;
              }
              
              ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, targetPanelSize, targetPanelSize);
              
              // Post index sequence: bottom-right to top-left
              const postIndex = (rows - 1 - r) * cols + (cols - 1 - c) + 1;
              
              newTiles.push({
                index: postIndex,
                dataUrl: canvas.toDataURL("image/jpeg", 0.95),
                row: r,
                col: c
              });
            }
          }
        }
        
        // Sort tiles by post index (1 to N)
        newTiles.sort((a, b) => a.index - b.index);
        setSlicedTiles(newTiles);
        
        toast({
          title: "Grid created!",
          description: `Successfully split your image into a 3x${gridRows} grid (${cols * rows} tiles).`
        });
      } catch (err) {
        console.error(err);
        toast({
          title: "Processing failed",
          description: "An error occurred while slicing your grid. Please try another image file.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    img.onerror = () => {
      toast({
        title: "Error loading image",
        description: "Could not load image source.",
        variant: "destructive"
      });
      setIsProcessing(false);
    };
    
    img.src = imageSrc;
  };

  const handleDownloadAll = async () => {
    if (slicedTiles.length === 0) return;
    
    for (let i = 0; i < slicedTiles.length; i++) {
      const tile = slicedTiles[i];
      const link = document.createElement("a");
      link.href = tile.dataUrl;
      link.download = `${imageName || "grid"}-post-${tile.index}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    
    toast({
      title: "All tiles downloaded!",
      description: "Follow the numbered files sequentially when uploading to Instagram."
    });
  };

  const handleDownloadSingle = (url: string, index: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${imageName || "grid"}-post-${index}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: `Post ${index} downloaded!`,
      description: "Tile file downloaded successfully."
    });
  };

  const handleScheduleCTA = () => {
    navigate(user ? "/create-post" : "/pricing");
  };

  const handleAutoSchedule = () => {
    const draftText = `Creating a seamless Instagram grid collage! Split into a 3x${gridRows} grid via ShipOS.`;
    const urls = slicedTiles.map((t) => t.dataUrl);
    localStorage.setItem("shipos_pending_draft", draftText);
    if (urls.length > 0) {
      localStorage.setItem("shipos_pending_media", JSON.stringify(urls));
      localStorage.setItem("shipos_pending_type", "image");
    }
    if (user) {
      navigate("/create-post", { 
        state: { 
          content: draftText, 
          mediaPreviews: urls.length > 0 ? urls : undefined,
          type: "image" 
        } 
      });
    } else {
      navigate("/pricing");
    }
  };

  const faqs = [
    {
      q: "What is an Instagram Grid Maker?",
      a: "An Instagram Grid Maker is a tool that takes a single photo and splits it into a grid of smaller square tiles. When you post these tiles sequentially to your profile, they assemble together to form one giant, high-impact photo collage."
    },
    {
      q: "What is the correct order to post grid tiles on Instagram?",
      a: "Because Instagram profiles load posts chronologically from top-left to bottom-right, you must post the grid tiles in reverse order. Post #1 (representing the bottom-right corner of the image) must be published first, followed by Post #2, continuing sequentially until the last post (top-left corner) is published."
    },
    {
      q: "Are my uploaded photos secure on ShipOS?",
      a: "Absolutely. The ShipOS Grid Maker processes your images entirely client-side using JavaScript and HTML5 Canvas. Your image is never uploaded to any remote server, ensuring complete local data privacy."
    },
    {
      q: "What grid layouts can I choose from?",
      a: "We support four standard layout configurations: 3x3 (9 tiles), 3x2 (6 tiles), 3x1 (3 horizontal banner tiles), and 3x4 (12 tiles)."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Free Instagram Grid Maker | Profile Collage Splitter | ShipOS"
        description="Cut photos into grid layouts (3x3, 3x2, 3x1, or 3x4 square tiles) for Instagram. Follow the numbered sequence to publish a giant profile collage."
        path="/instagram-grid-maker"
        type="website"
        keywords={["instagram grid maker", "instagram profile splitter", "grid photo cutter", "seamless grid maker", "instagram banner splitter"]}
        jsonLd={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Free Tools", path: "/instagram-grid-maker" },
            { name: "Instagram Grid Maker", path: "/instagram-grid-maker" }
          ]),
          softwareApplicationSchema()
        ]}
      />
      <Header />

      <main className="pt-28 pb-10">
        {/* Tool Header */}
        <section className="max-w-7xl mx-auto px-6 text-center mb-12">
          <SectionBadge label="Free Tool" text="Cut seamless profile collages" />
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            Instagram Grid Maker
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Split single photos into giant grid collages for your profile. Cut images into perfectly sized 1:1 squares with clear posting sequence numbers.
          </p>

          {/* AI GEO Answer Block */}
          <div className="max-w-3xl mx-auto mt-8 p-6 bg-white dark:bg-[#1c1917] border-2 border-black dark:border-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(215,90,52,0.15)] text-left">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#d75a34] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" /> Quick Answer: How do Instagram grids work?
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              An **Instagram Grid collage** splits a wide or tall image into square panels (each 1080x1080 px) matching Instagram's 3-column profile layout. Because new posts push older posts down, you must upload tiles in <strong>reverse order</strong>: beginning with the bottom-right tile (Post 1) and concluding with the top-left tile.
            </p>
          </div>
        </section>

        {/* Input & Output Workspace */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Inputs & Upload */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-foreground tracking-tight border-b border-border pb-3 flex items-center gap-2">
                <Grid className="w-5 h-5 text-[#d75a34]" /> Grid Parameters
              </h2>

              <div className="space-y-4">
                {/* Upload Area */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase font-black">
                    Upload Profile Photo
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={triggerUploadClick}
                    className="border-2 border-dashed border-black dark:border-neutral-800 bg-[#FAF7F5] dark:bg-neutral-900/40 p-8 text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex flex-col items-center justify-center gap-3 group"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-neutral-800 border-2 border-black dark:border-neutral-800 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
                      <Upload className="w-5 h-5 text-[#d75a34]" />
                    </div>
                    {imageName ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground truncate max-w-[280px]">
                          {imageName}
                        </p>
                        <p className="text-xs text-muted-foreground">Click to upload another file</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-foreground">Click to Upload or Drag & Drop</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Supports PNG, JPG, JPEG, WEBP</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid Template selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase font-black">
                    Grid Layout Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "3 x 3 Grid (9 tiles)", rows: 3 },
                      { label: "3 x 2 Grid (6 tiles)", rows: 2 },
                      { label: "3 x 1 Banner (3 tiles)", rows: 1 },
                      { label: "3 x 4 Grid (12 tiles)", rows: 4 }
                    ].map((item) => (
                      <button
                        key={item.rows}
                        onClick={() => {
                          setGridRows(item.rows);
                          setSlicedTiles([]); // clear previous slices
                        }}
                        className={cn(
                          "h-12 text-xs font-bold transition-all border border-black dark:border-neutral-800 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                          gridRows === item.rows
                            ? "bg-[#d75a34] text-white shadow-none translate-x-0.5 translate-y-0.5"
                            : "bg-white dark:bg-neutral-800 text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <Button
                  onClick={() => {
                    setImageSrc(null);
                    setImageName("");
                    setGridRows(3);
                    setSlicedTiles([]);
                  }}
                  variant="ghost"
                  className="h-10 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-none border border-border flex-1"
                >
                  Clear
                </Button>
                <Button
                  disabled={!imageSrc || isProcessing}
                  onClick={handleSplitGrid}
                  className="h-10 px-5 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-xs uppercase tracking-wider rounded-none border border-border/20 shadow-sm flex-1 flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Slicing...
                    </>
                  ) : (
                    <>
                      <Scissors className="w-3.5 h-3.5" />
                      Split Grid
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel: Output & Live Preview */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Preview Card */}
            <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-foreground tracking-tight border-b border-border pb-3 flex items-center gap-2">
                <Grid className="w-5 h-5 text-[#d75a34]" /> Grid Layout Preview
              </h2>

              {imageSrc ? (
                <div className="space-y-4">
                  {/* Grid Overlay Guide */}
                  <div className="relative border-2 border-black dark:border-neutral-800 bg-white dark:bg-[#1c1917] p-2 select-none overflow-hidden max-h-[380px] flex items-center justify-center">
                    <div className="relative">
                      <img src={imageSrc} alt="Preview" className="max-h-[320px] w-auto object-contain" />
                      
                      {/* Grid overlay borders */}
                      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))` }}>
                        {Array.from({ length: 3 * gridRows }).map((_, idx) => {
                          const r = Math.floor(idx / 3);
                          const c = idx % 3;
                          const postNum = (gridRows - 1 - r) * 3 + (2 - c) + 1;
                          
                          return (
                            <div 
                              key={idx} 
                              className="border border-dashed border-[#d75a34]/80 flex items-center justify-center relative bg-black/10 text-white font-black text-xs"
                            >
                              <span className="bg-[#d75a34] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] border border-black">
                                {postNum}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2.5 bg-muted/40 p-4 border border-border">
                    <Info className="w-4 h-4 text-[#d75a34] shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Numbers represent the **publishing sequence**. Upload Post #1 first, then Post #2, until the final tile is published. Sliced grids will export as square tiles (<strong>1080x1080 px</strong>).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-black dark:border-neutral-800 bg-[#FAF7F5] dark:bg-neutral-900/40 py-20 text-center flex flex-col items-center justify-center gap-3">
                  <Grid className="w-10 h-10 text-muted-foreground" />
                  <p className="text-sm font-bold text-muted-foreground">Upload a profile photo to display the grid overlays</p>
                </div>
              )}
            </div>

            {/* Sliced Output Grid */}
            {slicedTiles.length > 0 && (
              <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h3 className="text-base font-bold text-foreground">Sliced Grid Tiles ({slicedTiles.length})</h3>
                  <Button
                    onClick={handleDownloadAll}
                    className="h-9 px-4 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-xs uppercase tracking-wider rounded-none flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download All
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {slicedTiles.map((tile) => (
                    <div key={tile.index} className="border border-border bg-background p-2 rounded-none space-y-2 flex flex-col justify-between">
                      <div className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center">
                        <img src={tile.dataUrl} alt={`Tile ${tile.index}`} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-[#d75a34] text-white text-[10px] font-black px-1.5 py-0.5 rounded-none border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          Post #{tile.index}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleDownloadSingle(tile.dataUrl, tile.index)}
                        variant="outline"
                        className="w-full h-8 text-[10px] font-bold rounded-none border-border hover:bg-muted"
                      >
                        <Download className="w-3 h-3 mr-1" /> Post {tile.index}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Auto-Schedule Card */}
            <div className="border-2 border-black dark:border-neutral-800 bg-card rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(215,90,52,0.15)] p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] flex items-center justify-center shrink-0 border border-black dark:border-neutral-800">
                  <Sparkles className="w-6 h-6 text-[#d75a34]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground leading-tight">
                    Looks Good? Auto-Schedule It
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Auto-publish to Instagram, Facebook, X (Twitter), LinkedIn, TikTok, and more.
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Stunning profile grids demand absolute precision scheduling. Connect ShipOS to auto-schedule your post collages in the exact reverse sequence.
              </p>

              <button
                onClick={handleAutoSchedule}
                className="w-full h-14 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-sm tracking-[0.12em] uppercase flex items-center justify-center gap-2.5 rounded-none border-2 border-black transition-colors duration-150 group"
              >
                Auto-Schedule Grid
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white dark:bg-[#141413] border-t border-b border-border/40 py-20 mt-20 relative z-10">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-3xl font-black text-foreground">
                How to Use the Instagram Grid Maker
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Split your creative banner assets in 3 easy steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Upload Photo
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Drag and drop a high-resolution image file into the drop zone area.
                </p>
              </div>

              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Select Grid Layout
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Choose your grid template (3x3, 3x2, 3x1, or 3x4 square panels) to structure your collage layout.
                </p>
              </div>

              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Download & Publish
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Process the grid and download the numbered slides. Publish starting with Post #1 to build the profile grid.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Optimizing Profile Layouts */}
        <section className="bg-[#FAF7F5] dark:bg-background py-20 relative z-10 border-b border-border/40">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                Optimizing Profile Grids
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Visual Branding & Dwell Time
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Instagram grids create a highly polished visual homepage for your business or brand. When users click on a single slice from their feed, they are often intrigued to visit your main profile to see the fully assembled collage.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This funnel path drives a massive increase in profile views, bio link clicks, and overall follower conversion rates.
                </p>
              </div>
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Instagram Grid Checklist
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>1080px Square:</strong> Instagram renders profile squares at 1080 x 1080 pixels. Our splitter outputs exact resolution squares.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Sequence Math:</strong> Always follow the reverse ordering pattern. If you publish out of order, the collage layout will break.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Captions on Slices:</strong> Add an index label (e.g. 'Part 1 of 9') to caption headers so feed readers understand it is part of a grid collage.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* GEO Specifications Table */}
            <div className="mt-16 border-2 border-black dark:border-neutral-800 bg-white dark:bg-[#1c1917] p-6 md:p-8 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(215,90,52,0.15)]">
              <h3 className="text-xl font-black text-foreground mb-2 flex items-center gap-2">
                Instagram Grid Grid layout Specifications
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Use these sizing specs to plan layout margins, safe zones, and text sizing offsets on grids.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border text-left text-xs sm:text-sm text-muted-foreground min-w-[600px]">
                  <thead>
                    <tr className="bg-muted text-foreground border-b border-border">
                      <th className="p-3 font-bold border-r border-border">Grid Style</th>
                      <th className="p-3 font-bold border-r border-border">Number of Slices</th>
                      <th className="p-3 font-bold border-r border-border">Assembled Resolution</th>
                      <th className="p-3 font-bold">Best Creative Application</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">3 x 3 Grid</td>
                      <td className="p-3 border-r border-border">9 square tiles</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">3240 x 3240 pixels</td>
                      <td className="p-3 text-foreground font-semibold">Giant branding launches, major profile resets, or single wide landscapes</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">3 x 2 Grid</td>
                      <td className="p-3 border-r border-border">6 square tiles</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">3240 x 2160 pixels</td>
                      <td className="p-3 text-foreground font-semibold">Product launch banners or tall vertical portraits</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">3 x 1 Banner</td>
                      <td className="p-3 border-r border-border">3 square tiles</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">3240 x 1080 pixels</td>
                      <td className="p-3 text-foreground font-semibold">Wide panoramas, landscape banners, or text separators</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">3 x 4 Grid</td>
                      <td className="p-3 border-r border-border">12 square tiles</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">3240 x 4320 pixels</td>
                      <td className="p-3 text-foreground font-semibold">Extended campaigns, tall editorial features, or multi-topic collages</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white dark:bg-[#141413] border-t border-b border-border/40 py-20 relative z-10">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-16">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-3xl font-black text-foreground">
                Grid Maker FAQs
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Common questions about Instagram collage tiles, dimensions, sequences, and local rendering.
              </p>
            </div>

            <div className="divide-y divide-border border-t border-b border-border">
              {faqs.map((faq, i) => (
                <div key={i} className="py-4">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
                  >
                    <span className="text-base font-bold text-foreground group-hover:text-[#d75a34] transition-colors">
                      {faq.q}
                    </span>
                    <span className="text-[#d75a34] text-lg font-bold ml-4">
                      {openFaqIndex === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaqIndex === i && (
                    <div className="pb-4 text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Grow with ShipOS Pricing Section */}
        <section className="bg-[#FAF7F5] dark:bg-background border-t border-b border-border/40 py-20 relative z-10">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-14">
              <SectionBadge label="Grow" text="Supercharge your social presence" />
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                Grow with ShipOS
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
                Stop composing, start publishing. ShipOS auto-schedules your content across Instagram, Facebook, X (Twitter), LinkedIn, TikTok, Threads, and Bluesky — all from one workspace.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <span className={cn("text-xs font-bold tracking-widest transition-colors", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-primary rounded-none"
              />
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-bold tracking-widest transition-colors", isAnnual ? "text-foreground" : "text-muted-foreground")}>
                  Annual
                </span>
                <Badge className="bg-primary text-primary-foreground text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-none shadow-sm">
                  Save 20%
                </Badge>
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              {PLANS.map((plan) => {
                const price = isAnnual ? plan.price.annual : plan.price.monthly;
                const periodLabel = isAnnual ? "/year" : "/month";
                return (
                  <Card
                    key={plan.name}
                    className={cn(
                      "relative border-border bg-card shadow-none rounded-none overflow-hidden transition-all duration-300 flex flex-col justify-between h-full",
                      plan.popular ? "ring-2 ring-primary bg-primary/[0.02]" : "hover:border-primary/30",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-primary text-primary-foreground text-[10px] font-bold tracking-widest py-1 px-4 rounded-none">
                          {plan.badge}
                        </div>
                      </div>
                    )}
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-base font-bold tracking-widest text-muted-foreground">
                        {plan.name}
                      </CardTitle>
                      <div className="flex items-baseline gap-1 mb-2 mt-4">
                        <span className="text-4xl font-bold text-foreground tracking-tighter">${price}</span>
                        <span className="text-[10px] text-muted-foreground font-bold tracking-widest">{periodLabel}</span>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground font-medium leading-relaxed">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-6 space-y-8 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <p className="text-[9px] font-bold text-muted-foreground tracking-wider">Includes Features:</p>
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm font-medium text-foreground/90">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={handleScheduleCTA}
                        className={cn(
                          "w-full h-12 font-bold tracking-widest text-[10px] rounded-none shadow-none transition-all",
                          plan.popular
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-background text-foreground border border-border hover:bg-muted",
                        )}
                      >
                        Start 7-Day Trial
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Guarantee strip */}
            <div className="flex items-center justify-center gap-3 mt-10 text-muted-foreground">
              <Check className="w-4 h-4" />
              <p className="text-[10px] font-bold tracking-[0.15em]">
                Secure checkout via Dodo Payments • Cancel anytime • 7-day free trial
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-24 px-6 lg:px-8 bg-background relative z-10">
          <div className="max-w-[1000px] mx-auto relative">
            <div className="relative rounded-none bg-white dark:bg-[#1c1917] border-x-2 border-b-2 border-t-[8px] border-x-black border-b-black border-t-[#d75a34] dark:border-x-neutral-800 dark:border-b-neutral-800 p-10 md:p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)] flex flex-col items-center">
              
              {/* Logo centered */}
              <div className="flex items-center justify-center gap-1.5 mb-6 select-none font-bold text-2xl tracking-tight text-[#1c2024] dark:text-neutral-100">
                <span>Ship</span>
                <span className="bg-[#d75a34] text-white px-2 py-0.5 rounded-[4px] text-lg font-bold">OS</span>
              </div>
              
              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.2] text-[#1c2024] dark:text-neutral-100 mb-6 max-w-3xl">
                Your content is ready. Your audience is waiting. ShipOS ships it.
              </h2>
              
              {/* Subtitle */}
              <p className="text-gray-600 dark:text-neutral-400 text-sm sm:text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed mb-8">
                Takes less than 5 minutes to connect your first platform and schedule your first post.
              </p>

              {/* Social Icons row */}
              <div className="flex flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-8 select-none py-1">
                {[
                  { bg: "bg-[#0077B5]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>, name: "LinkedIn" },
                  { bg: "bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>, name: "Instagram" },
                  { bg: "bg-[#1877F2]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>, name: "Facebook" },
                  { bg: "bg-[#101010]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, name: "Twitter" },
                  { bg: "bg-[#FF0000]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93 .502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>, name: "YouTube" },
                  { bg: "bg-[#101010]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16"><path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/></svg>, name: "Threads" },
                  { bg: "bg-[#BD081C]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.12.115.226.085.345-.093.389-.301 1.224-.341 1.391-.054.221-.179.268-.413.16-1.545-.719-2.51-2.977-2.51-4.793 0-3.902 2.836-7.487 8.174-7.487 4.293 0 7.629 3.059 7.629 7.148 0 4.265-2.689 7.697-6.422 7.697-1.254 0-2.435-.651-2.839-1.42l-.772 2.94c-.28 1.066-1.037 2.403-1.542 3.226C8.854 23.834 10.373 24 12 24c6.63 0 12-5.373 12-12S18.63 0 12 0z"/></svg>, name: "Pinterest" },
                  { bg: "bg-[#0285FF]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 320 286"><path d="M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.949-86.633 90.636-114.439C277.126-.453 320-16.446 320 34.908c0 10.362-2.182 45.474-5.32 57.062-7.591 28.058-39.027 34.61-68.514 29.544 48.163 12.28 63.856 46.104 29.544 76.16-30.706 26.892-74.996 16.273-115.71 16.273-40.714 0-85.004 10.619-115.71-16.273-34.312-30.056-18.619-63.88 29.544-76.16-29.487 5.066-60.923-1.486-68.514-29.544C2.182 80.382 0 45.27 0 34.908 0-16.446 42.874-.453 69.364 19.146Z"/></svg>, name: "Bluesky" },
                  { bg: "bg-[#010101]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>, name: "TikTok" },
                ].map((badge) => (
                  <div key={badge.name} title={badge.name} className="transition-transform duration-200 hover:scale-110 shrink-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-[4px] flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 hover:-translate-y-0.5 transition-all duration-200",
                        badge.bg
                      )}
                    >
                      {badge.icon}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action Button */}
              <button
                onClick={() => navigate(user ? "/create-post" : "/pricing")}
                className="h-14 px-8 bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none border-2 border-black dark:border-neutral-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(215,90,52,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 font-bold text-base tracking-wide flex items-center justify-center gap-2 group"
              >
                Try it for $0 (7-days) →
              </button>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
