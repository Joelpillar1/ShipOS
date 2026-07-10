import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Search,
  ArrowRight,
  Clock,
  User,
  Calendar,
  Layers,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { breadcrumbSchema, organizationSchema } from "@/lib/seo";
import { BlogSocialIcons } from "@/components/BlogSocialIcons";

const SectionBadge = ({ label, text }: { label: string; text: string }) => (
  <div className="inline-flex items-center gap-2 border border-[#d75a34]/60 rounded-full p-1 pr-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm shadow-sm mb-6 max-w-full">
    <div className="bg-gradient-to-b from-[#e36e4b] to-[#d75a34] text-white text-[13px] font-bold px-3 py-1 rounded-full shadow-inner shrink-0 whitespace-nowrap">
      {label}
    </div>
    <span className="text-[13px] font-semibold text-gray-800 dark:text-neutral-200 tracking-wide whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
      <span>{text}</span>
    </span>
  </div>
);

interface BlogPost {
  id: string;
  title: string;
  description: string;
  excerpt: string;
  category: "Product Updates" | "SaaS Growth" | "Agency Workflows" | "Content Strategy";
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  image: string;
  isFeatured?: boolean;
}

export default function Blog() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "SaaS Growth", "Agency Workflows", "Content Strategy", "Automation"];

  const posts: BlogPost[] = [
    {
      id: "pinterest-content-calendar-pin-scheduling",
      title: "Pinterest Content Calendar & How to Schedule Pins (2026 Guide)",
      description: "Build a Pinterest content calendar and learn how to schedule Pinterest pins in 2026 — cadence, seasonal lead times, SEO titles, batching, and a 30-day plan for traffic.",
      excerpt: "Treat Pinterest like search: calendar fields, 3–5 fresh pins/day, 45–60 day seasonal lead time, pin SEO, and a batch-to-schedule workflow that compounds traffic.",
      category: "Content Strategy",
      author: "Joel Pillar",
      date: "July 10, 2026",
      readTime: "14 min read",
      tags: ["Schedule Pinterest Pins", "Pinterest Content Calendar", "Pinterest SEO", "Pinterest Growth", "Pin Scheduler"],
      image: "/images/shipos-pinterest-content-calendar-guide.png",
      isFeatured: true
    },
    {
      id: "linkedin-content-strategy-posting-schedule",
      title: "LinkedIn Content Strategy & Posting Schedule: The 2026 Playbook",
      description: "Build a LinkedIn content strategy that works in 2026 — pillars, 3–5 posts/week cadence, weekly posting schedule templates, formats, timing, and a 30-day plan for B2B growth.",
      excerpt: "Stop random LinkedIn posting. Get pillars, a 3–5x/week cadence, weekly schedule templates, timing tests, and a first-hour engagement system for B2B growth.",
      category: "Content Strategy",
      author: "Joel Pillar",
      date: "July 10, 2026",
      readTime: "15 min read",
      tags: ["LinkedIn Content Strategy", "LinkedIn Posting Schedule", "LinkedIn B2B Marketing", "LinkedIn Personal Branding", "LinkedIn Algorithm"],
      image: "/images/shipos-linkedin-content-strategy-guide.png",
      isFeatured: false
    },
    {
      id: "cross-posting-social-media-strategy",
      title: "Cross-Posting Strategy: Adapt One Idea Across Every Platform (2026)",
      description: "A practical cross posting strategy for 2026 — adapt vs duplicate, platform matrix, short-video rules, stagger timing, and a workflow to turn one idea into native posts.",
      excerpt: "Stop pasting the same caption everywhere. Learn adaptive cross-posting: platform matrix, watermark rules, 24–48h stagger, and a one-idea workflow that scales.",
      category: "Content Strategy",
      author: "Joel Pillar",
      date: "July 10, 2026",
      readTime: "14 min read",
      tags: ["Cross Posting", "Cross-Posting", "Content Repurposing", "Multi-Platform", "Social Media Strategy"],
      image: "/images/shipos-cross-posting-guide.png",
      isFeatured: false
    },
    {
      id: "best-time-to-post-on-instagram-2026",
      title: "Best Time to Post on Instagram in 2026 (Data + How to Find Yours)",
      description: "Find the best time to post on Instagram in 2026 — Sprout and Buffer benchmarks, how to use Insights, Reels vs feed vs Stories timing, and a 30-day test plan.",
      excerpt: "Midweek benchmarks from Sprout and Buffer, plus a clear Insights workflow so you stop guessing and start posting when your followers are actually online.",
      category: "Content Strategy",
      author: "Joel Pillar",
      date: "July 10, 2026",
      readTime: "14 min read",
      tags: ["Best Time to Post on Instagram", "Instagram Algorithm", "Instagram Growth", "Instagram Posting Schedule", "Instagram Insights"],
      image: "/images/shipos-best-time-instagram-guide.png",
      isFeatured: false
    },
    {
      id: "ai-content-creation-social-media-guide",
      title: "AI Content Creation for Social Media: The Complete Guide for 2026",
      description: "Learn how to use AI content creation for social media — prompts, brand voice, captions, platform adaptation, and a human edit workflow that keeps posts authentic.",
      excerpt: "Use AI for drafts without sounding generic: brand voice sheets, prompt systems, per-platform adaptation, disclosure rules, and a 30-day plan backed by 2026 HubSpot data.",
      category: "Content Strategy",
      author: "Joel Pillar",
      date: "July 10, 2026",
      readTime: "15 min read",
      tags: ["AI Content Creation", "AI Social Media", "AI Captions", "AI Copywriting", "Content Creation AI"],
      image: "/images/shipos-ai-content-creation-guide.png",
      isFeatured: false
    },
    {
      id: "social-media-content-calendar-guide",
      title: "Social Media Content Calendar: The Complete Guide for 2026",
      description: "Learn how to build a social media content calendar — pillars, cadence, templates, batching, and tools — so you stop scrambling and start publishing with a plan.",
      excerpt: "Build a content calendar that teams actually use: pillars, cadence, templates, batching, approvals, and a 30-day plan — plus how calendars differ from schedulers.",
      category: "Content Strategy",
      author: "Joel Pillar",
      date: "July 10, 2026",
      readTime: "16 min read",
      tags: ["Social Media Content Calendar", "Content Planner", "Content Planning", "Content Pillars", "Post Planner"],
      image: "/images/shipos-content-calendar-guide.png",
      isFeatured: false
    },
    {
      id: "social-media-scheduler-complete-guide-2026",
      title: "Social Media Scheduler: The Complete Guide for 2026",
      description: "The definitive guide to social media schedulers and scheduling tools — what they do, how to pick the best one, and how to schedule posts on social media without wasting hours every week.",
      excerpt: "Compare the best social media scheduling tools, find free options, and follow a 30-day plan to schedule posts on social media across 9 platforms.",
      category: "Content Strategy",
      author: "Joel Pillar",
      date: "July 5, 2026",
      readTime: "18 min read",
      tags: ["Social Media Scheduler", "Scheduling Tools", "Content Calendar", "Social Media Management Tools", "Buffer Alternatives"],
      image: "/images/shipos-social-media-scheduler-guide.png",
      isFeatured: false
    },
    {
      id: "saas-social-media-roi-2026",
      title: "The Factual Math of Social Media ROI for SaaS Founders in 2026",
      description: "Stop posting blindly. An operational breakdown of conversion funnels, subscription cost math, and why flat-rate workspace scheduling improves operating margins.",
      excerpt: "Building in public is a validated strategy, but without a structured funnel, impressions remain vanity metrics. Learn the direct translation of social reach to product trial registrations.",
      category: "SaaS Growth",
      author: "Joel Pillar",
      date: "July 2, 2026",
      readTime: "7 min read",
      tags: ["SaaS Marketing", "ROI Math", "Build in Public"],
      image: "/images/shipos-saas-roi-flat.png"
    },
    {
      id: "instagram-auto-publishing-automation-playbook",
      title: "The Mechanics of Instagram Auto-Publishing & Automation: Technical Guide",
      description: "A database-backed operational review of Instagram direct publishing and DM-funnel automation. Learn Meta Graph API container polling, rate-limits, and webhook payloads.",
      excerpt: "Unpack Meta's strict two-stage publishing flow and comment-to-DM webhook architecture. Learn how to architect fail-safe queues and safe high-yield direct message funnels.",
      category: "Automation",
      author: "Joel Pillar",
      date: "July 3, 2026",
      readTime: "14 min read",
      tags: ["Instagram Automation", "Meta Graph API", "Webhook DMs", "Social Operations"],
      image: "/images/shipos-instagram-automation.png"
    },
    {
      id: "tiktok-slideshows-scheduling-playbook",
      title: "The Mechanics of TikTok Slideshows & Scheduling: Technical Growth Playbook",
      description: "An in-depth, retention-backed analysis of TikTok's Photo Mode algorithm, swiping mechanics, posting API boundaries, and content repurposing workflows.",
      excerpt: "Unpack the unique math behind TikTok's Swipe-Through Rate (STR) and Card Dwell Time. Learn how to direct-publish image slideshows via official Content Posting APIs safely.",
      category: "Content Strategy",
      author: "Joel Pillar",
      date: "July 3, 2026",
      readTime: "13 min read",
      tags: ["TikTok Algorithm", "Slideshow Mode", "Direct Publishing API", "Content Repurposing"],
      image: "/images/shipos-tiktok-automation.png"
    },
    {
      id: "why-agencies-choose-workspace-isolation",
      title: "Workspace Isolation: Why Agencies Are Moving Away from Per-Profile Pricing",
      description: "An in-depth analysis of client management risks. How legacy per-profile pricing penalties stall agency growth and why secure database sandboxes are the professional standard.",
      excerpt: "Juggling multiple client social accounts on legacy setups leads to a high frequency of cross-client publishing errors. We review the operational benefits of strict, token-isolated client workspaces.",
      category: "Agency Workflows",
      author: "Joel Pillar",
      date: "June 28, 2026",
      readTime: "6 min read",
      tags: ["Agency Operations", "Client Security", "Workspace Design"],
      image: "/images/shipos-workspace-isolation.png"
    },
    {
      id: "mastering-see-more-algorithmic-dwell-time",
      title: "Why Your LinkedIn Impressions Dropped 50-65%",
      description: "An in-depth, database-backed operational breakdown of the LinkedIn feed classification engine. Learn character truncation heights, outbound link weights, and the mathematical parameters of Active Dwell Time.",
      excerpt: "Learn how to stop guessing and start treating your LinkedIn content as code structured to satisfy a sequence of mathematical constraints. This guide provides an operational, database-level breakdown of the algorithm's pipeline.",
      category: "Content Strategy",
      author: "Joel Pillar",
      date: "June 19, 2026",
      readTime: "12 min read",
      tags: ["LinkedIn Algorithm", "Dwell Time", "B2B Marketing", "Copywriting Blueprint"],
      image: "/images/shipos-dwell-time.png"
    }
  ];

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = activeCategory === "All" || post.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const featuredPost = useMemo(() => {
    return posts.find((post) => post.isFeatured);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background text-foreground">
      <SEO
        title="The ShipOS Blog — Social Media Operations & Strategy Guide"
        description="Factual, deeply detailed articles regarding SaaS building, agency client management, algorithmic feed optimization, and transparent product updates."
        path="/blog"
        type="website"
        keywords={[
          "social media operations blog",
          "saas marketing strategies",
          "agency content workflows",
          "dwell time algorithm optimization"
        ]}
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" }
          ]),
          organizationSchema()
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-20">
        {/* Page Header */}
        <section className="max-w-6xl mx-auto px-6 lg:px-12 text-center mb-12">
          <SectionBadge label="The Dispatch" text="Factual guides and product updates" />
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            The ShipOS Blog
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
            Deep-dive operational playbooks, algorithmic breakthroughs, and technical guidebooks for builders, marketing agencies, and professional creators.
          </p>
        </section>

        {/* Featured Post (only shows if search query is empty and active category is All) */}
        {searchQuery === "" && activeCategory === "All" && featuredPost && (
          <section className="max-w-6xl mx-auto px-6 lg:px-12 mb-16">
            <div className="border border-border bg-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative group">
              {/* Featured Image */}
              <div className="lg:col-span-4 relative h-64 lg:h-auto lg:min-h-[280px] overflow-hidden border-b lg:border-b-0 lg:border-r border-border bg-[#FAF7F5] dark:bg-neutral-900">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="absolute inset-0 w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>

              {/* Main text column */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#d75a34]/10 text-[#d75a34] border border-[#d75a34]/20">
                      Featured Playbook
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {featuredPost.category}
                    </span>
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-[#d75a34] transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                  
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                    {featuredPost.excerpt}
                  </p>
                  
                  <p className="text-[11px] sm:text-xs text-muted-foreground font-normal">
                    {featuredPost.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#d75a34]" /> {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {featuredPost.date}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-3 bg-muted/30 border-t lg:border-t-0 lg:border-l border-border p-6 sm:p-8 flex flex-col justify-center bg-gradient-to-b from-white/30 to-muted/20 dark:from-neutral-900/10 dark:to-neutral-950/20">
                <div className="space-y-4">
                  <span className="text-[10px] font-black tracking-widest text-[#d75a34] uppercase block">
                    Strategic Focus
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {featuredPost.tags.map((tag) => (
                      <span key={tag} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-border bg-white dark:bg-neutral-900 text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This detailed playbook breaks down the exact financial metrics that determine sustainable client conversion ratios.
                  </p>
                  <Button
                    onClick={() => navigate(`/blog/${featuredPost.id}`)}
                    variant="marketing" className="w-full uppercase tracking-widest text-xs h-11 mt-2"
                  >
                    Read Playbook <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Filters and Search Bar */}
        <section className="max-w-6xl mx-auto px-6 lg:px-12 mb-12">
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
                placeholder="Search playbook titles or tags..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-[#FAF7F5] dark:bg-neutral-900 border border-border focus:border-[#d75a34] outline-none rounded-none text-foreground placeholder:text-muted-foreground font-normal"
              />
            </div>

          </div>
        </section>

        {/* Playbook Cards Grid */}
        <section className="max-w-6xl mx-auto px-6 lg:px-12 mb-24 min-h-[300px]">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="group cursor-pointer relative bg-white dark:bg-[#1f1d1b] rounded-none border shadow-sm transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.1)] border-border overflow-hidden"
                >
                  {/* Card Feature Image */}
                  <div className="aspect-[3/2] w-full overflow-hidden relative border-b border-border bg-[#FAF7F5] dark:bg-neutral-900">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-4">
                      {/* Top Row: Category + Custom Badge */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#FAF7F5] dark:bg-neutral-900 text-muted-foreground border border-border">
                          {post.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {post.readTime}
                        </span>
                      </div>

                      {/* Header content */}
                      <div className="space-y-1.5">
                        <CardTitle className="text-base font-black text-foreground group-hover:text-[#d75a34] transition-colors leading-tight line-clamp-2">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground font-normal leading-relaxed line-clamp-3">
                          {post.description}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#d75a34]" /> {post.author}
                      </span>
                      {/* Bottom CTA Indicator */}
                      <div className="flex items-center text-xs font-bold text-[#d75a34] uppercase tracking-wider gap-1.5 group-hover:gap-2.5 transition-all">
                        Read Playbook
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-border/60 bg-white dark:bg-[#1f1d1b]">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-pulse" />
              <h3 className="text-base font-bold text-foreground">No playbooks matched your criteria</h3>
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

        {/* Segment solutions CTA */}
        <section className="max-w-5xl mx-auto px-6 text-center py-16 bg-white dark:bg-[#141413] border-2 border-black dark:border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)]">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Ready to Implement These Frameworks?
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-normal">
              Our segment-specific solutions detail exact guidelines, operational templates, and cadences for SaaS, marketing agencies, and personal brands.
            </p>

            <BlogSocialIcons className="pt-2 pb-2" />

            <div className="grid sm:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto">
              <Link
                to="/social-media-tool-for-agencies"
                className="group p-5 border border-border rounded-none bg-[#FAF7F5] dark:bg-neutral-900 hover:border-[#d75a34]/50 hover:bg-[#d75a34]/5 transition-all text-left flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-foreground group-hover:text-[#d75a34] transition-colors">For Agencies</h4>
                  <p className="text-sm text-muted-foreground font-normal leading-relaxed">Scale multiple client accounts on flat-rate isolated sandboxes.</p>
                </div>
                <span className="text-[10px] font-black text-[#d75a34] uppercase tracking-wider block pt-4 flex items-center gap-1">
                  View Guide <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>

              <Link
                to="/social-media-tool-for-saas-founders"
                className="group p-5 border border-border rounded-none bg-[#FAF7F5] dark:bg-neutral-900 hover:border-[#d75a34]/50 hover:bg-[#d75a34]/5 transition-all text-left flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-foreground group-hover:text-[#d75a34] transition-colors">For SaaS Founders</h4>
                  <p className="text-sm text-muted-foreground font-normal leading-relaxed">Execute build-in-public growth loops without constant context switching.</p>
                </div>
                <span className="text-[10px] font-black text-[#d75a34] uppercase tracking-wider block pt-4 flex items-center gap-1">
                  View Guide <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>

              <Link
                to="/social-media-tool-for-personal-brands"
                className="group p-5 border border-border rounded-none bg-[#FAF7F5] dark:bg-neutral-900 hover:border-[#d75a34]/50 hover:bg-[#d75a34]/5 transition-all text-left flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-foreground group-hover:text-[#d75a34] transition-colors">For Creators</h4>
                  <p className="text-sm text-muted-foreground font-normal leading-relaxed">Master layout spacings, custom unicode styles, and carousel PDF carousels.</p>
                </div>
                <span className="text-[10px] font-black text-[#d75a34] uppercase tracking-wider block pt-4 flex items-center gap-1">
                  View Guide <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
