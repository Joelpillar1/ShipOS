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
import { cn } from "@/lib/utils";
import { FreeToolFinalCta } from "@/components/FreeToolFinalCta";
import { FreeToolPricingSection } from "@/components/FreeToolPricingSection";
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

const SectionBadge = ({ label, text, mobileText }: { label: string; text: string; mobileText?: string }) => (
  <div className="inline-flex items-center gap-2 border border-[#d75a34]/60 rounded-full p-1 pr-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm shadow-sm mb-6 max-w-full">
    <div className="bg-gradient-to-b from-[#e36e4b] to-[#d75a34] text-white text-[13px] font-bold px-3 py-1 rounded-full shadow-inner shrink-0 whitespace-nowrap">
      {label}
    </div>
    <span className="text-[13px] font-semibold text-gray-800 dark:text-neutral-200 tracking-wide whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
      <span className={mobileText ? "hidden sm:inline" : "inline"}>{text}</span>
      {mobileText && <span className="inline sm:hidden">{mobileText}</span>}
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
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

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

      <main className="tools-header-padding pb-10">
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
              <SectionBadge label="Workflow" text="How it works under the hood" />
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
              <SectionBadge label="Best Practices" text="Optimize profile grid layouts" />
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
              <SectionBadge label="FAQ" text="Frequently Asked Questions" />
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

        {/* Platform Demo Video Section */}
        <section className="py-16 bg-white dark:bg-[#141413] border-t border-b border-border/40 relative z-10">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <SectionBadge label="Demo" text="Watch ShipOS in action" />
              <h2 className="text-3xl font-black text-foreground tracking-tight">
                See ShipOS in Action
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Watch how ShipOS simplifies planning, scheduling, and publishing across all your social platforms from a single dashboard.
              </p>
            </div>

            <div 
              onClick={isPlayingDemo ? undefined : () => setIsPlayingDemo(true)}
              className={cn(
                "relative w-full aspect-video bg-[#fbf4f2] border-2 border-black dark:border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)] flex items-center justify-center group overflow-hidden rounded-none mx-auto",
                !isPlayingDemo && "cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              )}
            >
              {isPlayingDemo ? (
                <iframe
                  src="https://www.youtube.com/embed/huwiFpCP614?autoplay=1"
                  title="ShipOS Platform Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              ) : (
                <>
                  
                  {/* Thumbnail Image */}
                  <img 
                    src="https://img.youtube.com/vi/huwiFpCP614/maxresdefault.jpg" 
                    alt="ShipOS Platform Demo Preview" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  
                  {/* Dark overlay for readability and premium feel */}
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center transition-colors duration-300 group-hover:bg-black/35">
                    {/* Play Button */}
                    <div className="relative z-10 w-20 h-20 bg-[#d75a34] rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <FreeToolPricingSection onCtaClick={() => handleScheduleCTA()} />

        <FreeToolFinalCta onCtaClick={() => navigate(user ? "/create-post" : "/pricing")} />
      </main>

      <Footer />
    </div>
  );
}
