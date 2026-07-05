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
import { Slider } from "@/components/ui/slider";
import {
  Sparkles,
  TrendingUp,
  Users,
  Check,
  ArrowRight,
  Info,
  Upload,
  Download,
  Scissors,
  Image as ImageIcon,
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

export default function InstagramCarouselSplitter() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // File states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [splitCount, setSplitCount] = useState<number>(3);
  const [aspectRatio, setAspectRatio] = useState<string>("4:5"); // "1:1" | "4:5" | "16:9"
  const [slicedPanels, setSlicedPanels] = useState<string[]>([]);
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
      setSlicedPanels([]); // clear previous slices
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSplitImage = () => {
    if (!imageSrc) return;
    
    setIsProcessing(true);
    const img = new Image();
    img.onload = () => {
      try {
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        let targetPanelWidth = 1080;
        let targetPanelHeight = 1080;
        if (aspectRatio === "4:5") {
          targetPanelHeight = 1350;
        } else if (aspectRatio === "16:9") {
          targetPanelHeight = 608;
        }
        
        const sliceWidth = imgWidth / splitCount;
        const sliceHeight = imgHeight;
        
        const newPanels: string[] = [];
        
        for (let i = 0; i < splitCount; i++) {
          const canvas = document.createElement("canvas");
          canvas.width = targetPanelWidth;
          canvas.height = targetPanelHeight;
          const ctx = canvas.getContext("2d");
          
          if (ctx) {
            const sx = i * sliceWidth;
            const sy = 0;
            const sw = sliceWidth;
            const sh = sliceHeight;
            
            const sliceAspectRatio = sw / sh;
            const targetAspectRatio = targetPanelWidth / targetPanelHeight;
            
            let cropX = sx;
            let cropY = sy;
            let cropWidth = sw;
            let cropHeight = sh;
            
            if (sliceAspectRatio > targetAspectRatio) {
              cropWidth = sh * targetAspectRatio;
              cropX = sx + (sw - cropWidth) / 2;
            } else if (sliceAspectRatio < targetAspectRatio) {
              cropHeight = sw / targetAspectRatio;
              cropY = sy + (sh - cropHeight) / 2;
            }
            
            ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, targetPanelWidth, targetPanelHeight);
            newPanels.push(canvas.toDataURL("image/jpeg", 0.95));
          }
        }
        
        setSlicedPanels(newPanels);
        toast({
          title: "Image processed!",
          description: `Successfully split your image into ${splitCount} seamless panels.`
        });
      } catch (err) {
        console.error(err);
        toast({
          title: "Processing failed",
          description: "An error occurred while slicing your image. Please try another image file.",
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
    if (slicedPanels.length === 0) return;
    
    for (let i = 0; i < slicedPanels.length; i++) {
      const link = document.createElement("a");
      link.href = slicedPanels[i];
      link.download = `${imageName || "carousel"}-slide-${i + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    
    toast({
      title: "All slides downloaded!",
      description: "Check your browser's download folder for the sliced image files."
    });
  };

  const handleDownloadSingle = (url: string, index: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${imageName || "carousel"}-slide-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: `Slide ${index + 1} downloaded!`,
      description: "Slide file downloaded successfully."
    });
  };

  const handleScheduleCTA = () => {
    navigate(user ? "/create-post" : "/pricing");
  };

  const handleAutoSchedule = () => {
    const draftText = `Creating a seamless Instagram carousel! Split into ${splitCount} slides via ShipOS.`;
    localStorage.setItem("shipos_pending_draft", draftText);
    
    if (slicedPanels.length > 0) {
      localStorage.setItem("shipos_pending_media", JSON.stringify(slicedPanels));
      localStorage.setItem("shipos_pending_type", "image");
    }

    if (user) {
      navigate("/create-post", { 
        state: { 
          content: draftText, 
          mediaPreviews: slicedPanels.length > 0 ? slicedPanels : undefined,
          type: "image" 
        } 
      });
    } else {
      navigate("/pricing");
    }
  };

  const faqs = [
    {
      q: "What is an Instagram Carousel Splitter?",
      a: "An Instagram Carousel Splitter is a tool that takes a wide panoramic image and cuts it horizontally into multiple equal-sized panels. This allows you to post them on Instagram as a multi-photo carousel post, creating a seamless, swipeable panoramic effect on mobile feeds."
    },
    {
      q: "What is the best aspect ratio for Instagram carousels?",
      a: "The most engaging aspect ratio for Instagram carousels is 4:5 Portrait (1080 x 1350 px), as it occupies the maximum vertical screen space on mobile devices. 1:1 Square (1080 x 1080 px) is also highly standard, while 16:9 Landscape is less recommended due to lower feed visibility."
    },
    {
      q: "Are my uploaded images secure on ShipOS?",
      a: "Yes, completely. The ShipOS Carousel Splitter processes your images entirely inside your browser using client-side JavaScript and HTML5 Canvas. Your image is never uploaded to any remote server, ensuring complete privacy."
    },
    {
      q: "How many panels can I split my image into?",
      a: "Instagram allows up to 10 photos or videos in a single carousel post. Our splitter supports dividing your panoramas into 2 to 6 panels to keep image quality high and avoid extreme stretching."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Free Instagram Carousel Splitter | Panoramic Swipe Cutter | ShipOS"
        description="Cut wide panorama photos into seamless slides for Instagram carousels. Choose 1:1 square or 4:5 portrait splits and download them instantly."
        path="/instagram-carousel-splitter"
        type="website"
        keywords={["instagram carousel splitter", "instagram grid cutter", "panoramic carousel maker", "seamless carousel cutter", "instagram panorama maker"]}
        jsonLd={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Free Tools", path: "/instagram-carousel-splitter" },
            { name: "Instagram Carousel Splitter", path: "/instagram-carousel-splitter" }
          ]),
          softwareApplicationSchema()
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-10">
        {/* Tool Header */}
        <section className="max-w-7xl mx-auto px-6 text-center mb-12">
          <SectionBadge label="Free Tool" text="Cut seamless swipeable slides" />
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            Instagram Carousel Splitter
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Turn panoramic photos into seamless swipeable carousels. Slice wide images into perfectly proportioned square or portrait panels instantly in your browser.
          </p>

          {/* AI GEO Answer Block */}
          <div className="max-w-3xl mx-auto mt-8 p-6 bg-white dark:bg-[#1c1917] border-2 border-black dark:border-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(215,90,52,0.15)] text-left">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#d75a34] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" /> Quick Answer: What is a Seamless Instagram Carousel?
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              A **Seamless Instagram Carousel** is a post featuring a wide panoramic photo split into multiple slides. As users swipe through the slides, the image transitions without gaps. Slicing is typically performed horizontally, matching the optimal post aspect ratios: <strong>4:5 Portrait (1080x1350)</strong> or <strong>1:1 Square (1080x1080)</strong>.
            </p>
          </div>
        </section>

        {/* Input & Output Workspace */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Inputs & Upload */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-foreground tracking-tight border-b border-border pb-3 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[#d75a34]" /> Split Parameters
              </h2>

              <div className="space-y-4">
                {/* Upload Area */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase font-black">
                    Upload Panorama Image
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

                {/* Split count */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase font-black">
                      Split Panels Count
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {splitCount} slides
                    </span>
                  </div>
                  <Slider
                    value={[splitCount]}
                    onValueChange={(val) => {
                      setSplitCount(val[0]);
                      setSlicedPanels([]); // clear previous slices
                    }}
                    min={2}
                    max={6}
                    step={1}
                    className="py-2"
                  />
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase font-black">
                    Slide Aspect Ratio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "1:1 Square", val: "1:1" },
                      { label: "4:5 Portrait", val: "4:5" },
                      { label: "16:9 Landscape", val: "16:9" }
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => {
                          setAspectRatio(item.val);
                          setSlicedPanels([]); // clear previous slices
                        }}
                        className={cn(
                          "h-10 text-xs font-bold transition-all border border-black dark:border-neutral-800 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                          aspectRatio === item.val
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
                    setSplitCount(3);
                    setAspectRatio("4:5");
                    setSlicedPanels([]);
                  }}
                  variant="ghost"
                  className="h-10 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-none border border-border flex-1"
                >
                  Clear
                </Button>
                <Button
                  disabled={!imageSrc || isProcessing}
                  onClick={handleSplitImage}
                  className="h-10 px-5 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-xs uppercase tracking-wider rounded-none border border-border/20 shadow-sm flex-1 flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Splitting...
                    </>
                  ) : (
                    <>
                      <Scissors className="w-3.5 h-3.5" />
                      Split Image
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
                <ImageIcon className="w-5 h-5 text-[#d75a34]" /> Layout Guide Preview
              </h2>

              {imageSrc ? (
                <div className="space-y-4">
                  {/* Aspect Ratio Guide */}
                  <div className="relative border-2 border-black dark:border-neutral-800 bg-white dark:bg-[#1c1917] p-2 select-none overflow-hidden max-h-[350px] flex items-center justify-center">
                    <img src={imageSrc} alt="Preview" className="max-h-[300px] w-auto object-contain" />
                    
                    {/* Overlay Grid splits */}
                    <div className="absolute inset-2 pointer-events-none flex justify-between">
                      {Array.from({ length: splitCount - 1 }).map((_, idx) => (
                        <div 
                          key={idx} 
                          className="h-full border-r-2 border-dashed border-[#d75a34] drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]"
                          style={{ left: `${((idx + 1) / splitCount) * 100}%`, position: "absolute" }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2.5 bg-muted/40 p-4 border border-border">
                    <Info className="w-4 h-4 text-[#d75a34] shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The orange dashed lines show exactly where your image will be split. Sliced slide outputs are configured at <strong>1080px width</strong> per panel to optimize Instagram feed resolution.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-black dark:border-neutral-800 bg-[#FAF7F5] dark:bg-neutral-900/40 py-20 text-center flex flex-col items-center justify-center gap-3">
                  <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  <p className="text-sm font-bold text-muted-foreground">Upload a panorama image to display the crop guides</p>
                </div>
              )}
            </div>

            {/* Sliced Output Grid */}
            {slicedPanels.length > 0 && (
              <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h3 className="text-base font-bold text-foreground">Sliced Slide Panels ({slicedPanels.length})</h3>
                  <Button
                    onClick={handleDownloadAll}
                    className="h-9 px-4 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-xs uppercase tracking-wider rounded-none flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download All
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {slicedPanels.map((panel, idx) => (
                    <div key={idx} className="border border-border bg-background p-2 rounded-none space-y-2 flex flex-col justify-between">
                      <div className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center">
                        <img src={panel} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-none">
                          #{idx + 1}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleDownloadSingle(panel, idx)}
                        variant="outline"
                        className="w-full h-8 text-[10px] font-bold rounded-none border-border hover:bg-muted"
                      >
                        <Download className="w-3 h-3 mr-1" /> Slide {idx + 1}
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
                Consistent carousels build high visual footprint authority. Schedule your multi-slide carousels across channels in a single click using ShipOS.
              </p>

              <button
                onClick={handleAutoSchedule}
                className="w-full h-14 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-sm tracking-[0.12em] uppercase flex items-center justify-center gap-2.5 rounded-none border-2 border-black transition-colors duration-150 group"
              >
                Auto-Schedule Carousel
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
                How to Use the Instagram Carousel Splitter
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Split your horizontal panoramic assets in 3 easy steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Upload Panorama File
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Drag and drop a wide landscape/panoramic image file into the parameter upload zone.
                </p>
              </div>

              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Configure Aspect & Slices
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Select your slide panel aspect ratio (1:1 square or 4:5 portrait) and slide panels split count slider.
                </p>
              </div>

              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Process & Download
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Click 'Split Image' to execute local slicing, then download individual panels or bulk download the slices sequentially.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Optimizing Instagram Carousels */}
        <section className="bg-[#FAF7F5] dark:bg-background py-20 relative z-10 border-b border-border/40">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <SectionBadge label="Best Practices" text="Optimize carousel posts" />
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                Optimizing Instagram Carousels
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  The Swipe Engagement Multiplier
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Carousels are favored by the Instagram home feed recommendation algorithm. If a follower scrolls past your post without engaging, Instagram will often show the post to that user a second time in their feed, but displaying the **second slide** instead.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This doubles your organic impressions. Slicing panoramas into seamless swipeable boards prompts readers to swipe, increasing dwell time and interactions.
                </p>
              </div>
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Instagram Image Specs Checklist
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Uniform Ratios:</strong> All slides in an Instagram carousel must share the same aspect ratio (e.g. all 1:1 or all 4:5). Slicing standardizes ratios.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>1080px Rule:</strong> Export images at exactly 1080px width per slide to preserve compression sharpness.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Swipe CTAs:</strong> Include a subtle arrow graphic or 'swipe for more' indicator on early slides.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* GEO Benchmark Reference Table */}
            <div className="mt-16 border-2 border-black dark:border-neutral-800 bg-white dark:bg-[#1c1917] p-6 md:p-8 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(215,90,52,0.15)]">
              <h3 className="text-xl font-black text-foreground mb-2 flex items-center gap-2">
                Instagram Aspect Ratio & Resolution Specs
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Use these sizing specs to plan layout margins, safe zones, and text sizing offsets on slides.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border text-left text-xs sm:text-sm text-muted-foreground min-w-[600px]">
                  <thead>
                    <tr className="bg-muted text-foreground border-b border-border">
                      <th className="p-3 font-bold border-r border-border">Aspect Ratio</th>
                      <th className="p-3 font-bold border-r border-border">Recommended Resolution</th>
                      <th className="p-3 font-bold border-r border-border">Best Use Case</th>
                      <th className="p-3 font-bold">Crop Safety Guidelines</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">4:5 Portrait</td>
                      <td className="p-3 border-r border-border">1080 x 1350 pixels</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">Primary Feed Carousels</td>
                      <td className="p-3 text-foreground font-semibold">Keep critical text inside center 1080x1080 region for grid preview</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">1:1 Square</td>
                      <td className="p-3 border-r border-border">1080 x 1080 pixels</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">Multi-platform posts</td>
                      <td className="p-3 text-foreground font-semibold">Displays uniformly on both feed card and profile grids</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">16:9 Landscape</td>
                      <td className="p-3 border-r border-border">1080 x 608 pixels</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">Product landscapes</td>
                      <td className="p-3 text-foreground font-semibold">Leads to high border margins on mobile feed screens</td>
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
                Carousel Splitter FAQs
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Common questions about Instagram slide uploads, dimensions, image files, and privacy safety.
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
