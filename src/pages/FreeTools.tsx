import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { faqSchema, breadcrumbSchema, softwareApplicationSchema } from "@/lib/seo";
import {
  Sparkles,
  Search,
  ArrowRight,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  Scissors,
  Grid,
  Type,
  CheckSquare,
  Coins,
  ChevronRight
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

interface ToolItem {
  id: string;
  title: string;
  description: string;
  path: string;
  platform: "LinkedIn" | "X" | "Instagram" | "Facebook" | "TikTok" | "YouTube" | "Multi-Platform";
  category: "Calculators" | "Formatters & Previewers" | "Instagram & Media";
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  hoverAccentBg: string;
  badge?: string;
}

export default function FreeTools() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Are these social media tools completely free to use?",
      a: "Yes! Every utility in the ShipOS suite of free tools is 100% free with no registration, email requirements, or credit cards needed. Simply open the tool in your browser and start using it instantly."
    },
    {
      q: "Is my draft text or uploaded media secure?",
      a: "Absolutely. All processing (such as splitting images, counting characters, formatting layouts, or estimating metrics) is executed completely locally in your browser using client-side JavaScript. Your text and image files are never uploaded to any remote server, ensuring complete confidentiality."
    },
    {
      q: "Do the tools support mobile viewports?",
      a: "Yes. All formatters, calculators, and builders are fully responsive and optimized to look and work beautifully across smartphones, tablet devices, and desktop screens."
    },
    {
      q: "What is the benefit of integrating these tools with the main ShipOS app?",
      a: "While our free tools are perfect for quick single-post formatting or metric auditing, the main ShipOS app allows you to connect multiple official social profiles, schedule content in advance on a visual drag-and-drop calendar, generate posts using AI, and automatically publish across platforms with a single click."
    }
  ];

  const tools: ToolItem[] = [
    {
      id: "linkedin-hook-previewer",
      title: "LinkedIn Hook Previewer",
      description: "Preview how your post hooks look on mobile and desktop layout cards before publishing, preventing the awkward 'see more' truncation.",
      path: "/linkedin-hook-previewer",
      platform: "LinkedIn",
      category: "Formatters & Previewers",
      icon: Linkedin,
      accentColor: "border-l-4 border-l-[#0077B5] border-r-border border-y-border",
      hoverAccentBg: "hover:border-[#0077B5] dark:hover:border-[#0077B5] hover:shadow-[4px_4px_0px_0px_rgba(0,119,181,0.15)]",
      badge: "Popular"
    },
    {
      id: "linkedin-text-formatter",
      title: "LinkedIn Text Formatter",
      description: "Add rich bold, italic unicode layouts, clean spacing, and special bullets to increase post scannability and dwell time.",
      path: "/linkedin-text-formatter",
      platform: "LinkedIn",
      category: "Formatters & Previewers",
      icon: Type,
      accentColor: "border-l-4 border-l-[#0077B5] border-r-border border-y-border",
      hoverAccentBg: "hover:border-[#0077B5] dark:hover:border-[#0077B5] hover:shadow-[4px_4px_0px_0px_rgba(0,119,181,0.15)]"
    },
    {
      id: "linkedin-engagement-calculator",
      title: "LinkedIn Engagement Calculator",
      description: "Analyze profile reach velocity. Calculate view-based and follower-based engagement rates, and estimate sponsored post valuations.",
      path: "/linkedin-engagement-calculator",
      platform: "LinkedIn",
      category: "Calculators",
      icon: Linkedin,
      accentColor: "border-l-4 border-l-[#0077B5] border-r-border border-y-border",
      hoverAccentBg: "hover:border-[#0077B5] dark:hover:border-[#0077B5] hover:shadow-[4px_4px_0px_0px_rgba(0,119,181,0.15)]"
    },
    {
      id: "x-thread-formatter",
      title: "X Thread Formatter & Previewer",
      description: "Draft, format, and preview long-form threads. Automatically split paragraphs at character boundaries with draft memory.",
      path: "/x-thread-formatter",
      platform: "X",
      category: "Formatters & Previewers",
      icon: () => (
        <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      accentColor: "border-l-4 border-l-black dark:border-l-neutral-400 border-r-border border-y-border",
      hoverAccentBg: "hover:border-black dark:hover:border-neutral-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]",
      badge: "Essential"
    },
    {
      id: "twitter-text-formatter",
      title: "Twitter / X Text Formatter",
      description: "Convert your tweets to bold, italic, and cursive unicode layouts, track standard character limits, and preview live feeds.",
      path: "/twitter-text-formatter",
      platform: "X",
      category: "Formatters & Previewers",
      icon: Type,
      accentColor: "border-l-4 border-l-black dark:border-l-neutral-400 border-r-border border-y-border",
      hoverAccentBg: "hover:border-black dark:hover:border-neutral-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]"
    },
    {
      id: "x-engagement-calculator",
      title: "X (Twitter) Engagement Calculator",
      description: "Compute your X engagement indexes based on impressions, replies, reposts, bookmarks, and estimate corporate sponsor fees.",
      path: "/x-engagement-calculator",
      platform: "X",
      category: "Calculators",
      icon: () => (
        <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      accentColor: "border-l-4 border-l-black dark:border-l-neutral-400 border-r-border border-y-border",
      hoverAccentBg: "hover:border-black dark:hover:border-neutral-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]"
    },
    {
      id: "instagram-engagement-calculator",
      title: "Instagram Engagement Calculator",
      description: "Measure active audience resonance. Analyze profile likes, comments, and project sponsored post valuation ranges.",
      path: "/instagram-engagement-calculator",
      platform: "Instagram",
      category: "Calculators",
      icon: Instagram,
      accentColor: "border-l-4 border-l-[#E1306C] border-r-border border-y-border",
      hoverAccentBg: "hover:border-[#E1306C] dark:hover:border-[#E1306C] hover:shadow-[4px_4px_0px_0px_rgba(225,48,108,0.15)]"
    },
    {
      id: "instagram-carousel-splitter",
      title: "Instagram Carousel Splitter",
      description: "Slice horizontal panoramic photos into seamless swipeable panels (1:1 or 4:5 ratios) inside your browser client-side.",
      path: "/instagram-carousel-splitter",
      platform: "Instagram",
      category: "Instagram & Media",
      icon: Scissors,
      accentColor: "border-l-4 border-l-[#E1306C] border-r-border border-y-border",
      hoverAccentBg: "hover:border-[#E1306C] dark:hover:border-[#E1306C] hover:shadow-[4px_4px_0px_0px_rgba(225,48,108,0.15)]",
      badge: "Visual"
    },
    {
      id: "instagram-grid-maker",
      title: "Instagram Grid Maker",
      description: "Crop panoramic or portrait images into structured 3x3, 3x2, or 3x1 layout panels to design a visually striking profile grid.",
      path: "/instagram-grid-maker",
      platform: "Instagram",
      category: "Instagram & Media",
      icon: Grid,
      accentColor: "border-l-4 border-l-[#E1306C] border-r-border border-y-border",
      hoverAccentBg: "hover:border-[#E1306C] dark:hover:border-[#E1306C] hover:shadow-[4px_4px_0px_0px_rgba(225,48,108,0.15)]"
    },
    {
      id: "facebook-engagement-calculator",
      title: "Facebook Engagement Calculator",
      description: "Calculate Page reach-to-interaction benchmarks. Estimate organic distribution value and professional post sponsor fees.",
      path: "/facebook-engagement-calculator",
      platform: "Facebook",
      category: "Calculators",
      icon: Facebook,
      accentColor: "border-l-4 border-l-[#1877F2] border-r-border border-y-border",
      hoverAccentBg: "hover:border-[#1877F2] dark:hover:border-[#1877F2] hover:shadow-[4px_4px_0px_0px_rgba(24,119,242,0.15)]"
    },
    {
      id: "tiktok-money-calculator",
      title: "TikTok Money Calculator",
      description: "Audit creator profile valuation metrics. Estimate video earnings based on views, follower numbers, and view parameters.",
      path: "/tiktok-money-calculator",
      platform: "TikTok",
      category: "Calculators",
      icon: () => (
        <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
      accentColor: "border-l-4 border-l-cyan-500 border-r-border border-y-border",
      hoverAccentBg: "hover:border-cyan-500 dark:hover:border-cyan-500 hover:shadow-[4px_4px_0px_0px_rgba(6,182,212,0.15)]"
    },
    {
      id: "youtube-engagement-calculator",
      title: "YouTube Engagement Calculator",
      description: "Analyze video engagement ratios and CPM payouts. Estimate channel sponsor rates based on subscribers and views.",
      path: "/youtube-engagement-calculator",
      platform: "YouTube",
      category: "Calculators",
      icon: Youtube,
      accentColor: "border-l-4 border-l-[#FF0000] border-r-border border-y-border",
      hoverAccentBg: "hover:border-[#FF0000] dark:hover:border-[#FF0000] hover:shadow-[4px_4px_0px_0px_rgba(255,0,0,0.15)]"
    },
    {
      id: "social-post-limit-checker",
      title: "Social Post Limit Checker",
      description: "Instantly check caption characters, hashtag lists, and media limits across X, LinkedIn, Instagram, TikTok, and threads.",
      path: "/social-post-limit-checker",
      platform: "Multi-Platform",
      category: "Formatters & Previewers",
      icon: CheckSquare,
      accentColor: "border-l-4 border-l-[#d75a34] border-r-border border-y-border",
      hoverAccentBg: "hover:border-[#d75a34] dark:hover:border-[#d75a34] hover:shadow-[4px_4px_0px_0px_rgba(215,90,52,0.15)]",
      badge: "Utility"
    }
  ];

  const categories = ["All", "Calculators", "Formatters & Previewers", "Instagram & Media"];

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.platform.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === "All" || tool.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Free Creator & Social Media Tools | ShipOS"
        description="A premium suite of free tools for content creators: engagement calculators, text formatters, image splitters, post limit checkers, and previewers."
        path="/free-tools"
        type="website"
        keywords={[
          "free creator tools",
          "social media tools",
          "engagement rate calculator",
          "instagram splitter",
          "linkedin hook previewer",
          "x thread formatter"
        ]}
        jsonLd={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Free Tools", path: "/free-tools" }
          ]),
          softwareApplicationSchema()
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-10">
        {/* Page Header */}
        <section className="max-w-7xl mx-auto px-6 text-center mb-12">
          <SectionBadge label="Creator Utilities" text="Grow your digital presence for free" />
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            Free Social Media Tools
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Boost your post visibility, format clean layouts, and calculate accurate profile indicators instantly. Zero registration required.
          </p>
          <p className="text-xs text-muted-foreground mt-4 font-medium">
            Need full publishing workflows? See the{" "}
            <a
              href="/ai-social-media-scheduler"
              className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity font-medium"
            >
              AI social media scheduler guide
            </a>
            {" "}for detailed platform and scheduling information.
          </p>
        </section>

        {/* Filters and Search Bar */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#141413] border border-border/40 p-4 md:p-6 rounded-none shadow-sm z-10 relative">
            
            {/* Category selection */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 text-xs font-bold transition-all border border-black dark:border-neutral-800 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    activeCategory === cat
                      ? "bg-[#d75a34] text-white shadow-none translate-x-0.5 translate-y-0.5"
                      : "bg-[#FAF7F5] dark:bg-neutral-900 text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools or platforms..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-[#FAF7F5] dark:bg-neutral-900 border border-border focus:border-[#d75a34] outline-none rounded-none text-foreground placeholder:text-muted-foreground font-normal"
              />
            </div>

          </div>
        </section>

        {/* Directory Grid */}
        <section className="max-w-7xl mx-auto px-6 mb-24 min-h-[300px]">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Card
                    key={tool.id}
                    onClick={() => navigate(tool.path)}
                    className={cn(
                      "group cursor-pointer relative bg-white dark:bg-[#1f1d1b] rounded-none p-5 border shadow-sm transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.1)]",
                      tool.accentColor,
                      tool.hoverAccentBg
                    )}
                  >
                    <div className="space-y-4">
                      {/* Top Row: Icon + Brand Badge + Custom Badge */}
                      <div className="flex justify-between items-center">
                        <div className="w-10 h-10 bg-[#fdf2ec] dark:bg-[#3d241c] flex items-center justify-center border border-black dark:border-neutral-800">
                          <IconComponent className="w-5 h-5 text-[#d75a34]" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border border-border bg-[#FAF7F5] dark:bg-neutral-900 text-muted-foreground">
                            {tool.platform}
                          </span>
                          {tool.badge && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#d75a34]/10 text-[#d75a34] border border-[#d75a34]/20">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Header content */}
                      <div className="space-y-1.5">
                        <CardTitle className="text-base font-black text-foreground group-hover:text-[#d75a34] transition-colors leading-tight">
                          {tool.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground font-medium leading-relaxed">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </div>

                    {/* Bottom CTA Indicator */}
                    <div className="pt-4 flex items-center text-xs font-bold text-[#d75a34] uppercase tracking-wider gap-1.5 group-hover:gap-2.5 transition-all">
                      Open Tool
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-border/60 bg-white dark:bg-[#1f1d1b]">
              <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-pulse" />
              <h3 className="text-base font-bold text-foreground">No tools matched your criteria</h3>
              <p className="text-xs text-muted-foreground mt-1">Try resetting category filters or search queries.</p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                variant="outline"
                className="mt-4 rounded-none text-xs font-bold hover:bg-neutral-100"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section className="bg-white dark:bg-[#141413] border-t border-b border-border/40 py-20 relative z-10">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-16">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-3xl font-black text-foreground">
                Free Tools FAQs
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-normal tracking-wider">
                Common questions about browser safety, usage rules, and integrations.
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
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d75a34]/10 border border-[#d75a34]/20 text-[#d75a34] text-xs font-bold uppercase tracking-wider rounded-none">
                <Sparkles className="w-3.5 h-3.5" /> Product Demo
              </div>
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

              <Button
                onClick={() => navigate("/signup")}
                variant="marketing" className="text-sm tracking-[0.12em] uppercase py-4 px-8 h-auto"
              >
                Get Started for Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
