import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DollarSign,
  Users,
  Heart,
  Eye,
  Check,
  ArrowRight,
  Info,
  ChevronDown
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

export default function TikTokMoneyCalculator() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Calculator inputs
  const [followers, setFollowers] = useState<string>("50000");
  const [avgViews, setAvgViews] = useState<string>("20000");
  const [avgLikes, setAvgLikes] = useState<string>("1200");
  const [postsPerMonth, setPostsPerMonth] = useState<string>("15");

  // Accordion faq index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Parsing numbers safely
  const followersNum = Math.max(parseFloat(followers) || 0, 1);
  const viewsNum = Math.max(parseFloat(avgViews) || 0, 0);
  const likesNum = Math.max(parseFloat(avgLikes) || 0, 0);

  // 1. Creator Rewards Program (Creator Fund) calculation
  // Typically $0.40 - $1.00 RPM on qualified views (videos longer than 1 min).
  // Assume ~55% of average views are qualified.
  const monthlyVideos = Math.max(parseFloat(postsPerMonth) || 0, 0);
  const qualifiedViewsRatio = 0.55;
  const monthlyViews = viewsNum * monthlyVideos;
  const qualifiedViews = monthlyViews * qualifiedViewsRatio;
  const fundMin = Math.round((qualifiedViews / 1000) * 0.40);
  const fundMax = Math.round((qualifiedViews / 1000) * 1.10);

  // 2. Sponsored Video post estimate
  // Suggests pricing based on average views (CPM of $12 - $30) and follower size base
  const sponsoredMin = Math.round(Math.max((viewsNum / 1000) * 11, (followersNum / 10000) * 90));
  const sponsoredMax = Math.round(Math.max((viewsNum / 1000) * 26, (followersNum / 10000) * 220));

  // Determine Creator Tier
  let creatorTier = "Mid-Tier Creator";
  if (followersNum < 10000) {
    creatorTier = "Nano Creator";
  } else if (followersNum >= 10000 && followersNum < 50000) {
    creatorTier = "Micro Creator";
  } else if (followersNum >= 50000 && followersNum < 500000) {
    creatorTier = "Mid-Tier Creator";
  } else {
    creatorTier = "Macro Creator";
  }

  // Determine Reach Ratio & Advice
  const reachRatio = viewsNum / followersNum;
  let reachRating = "Healthy";
  let ratingColor = "text-[#d75a34]";
  let advice = "Solid reach velocity! To boost your reach to the next tier, experiment with structured multi-part series and respond to top comments with video replies to build high dwell time.";

  if (reachRatio < 0.10) {
    reachRating = "Low Reach";
    ratingColor = "text-amber-600";
    advice = "Your views are low relative to your follower size. Focus on high-tension 3-second hooks, trending sounds, and keep video duration short (11-15s) to boost completion rate.";
  } else if (reachRatio >= 0.10 && reachRatio < 0.30) {
    reachRating = "Healthy Reach";
    ratingColor = "text-[#d75a34]";
    advice = "Great reach! Your videos are converting nicely. Start optimizing for the Creator Rewards Program by producing high-quality landscape videos over 60 seconds.";
  } else {
    reachRating = "Viral Coefficient";
    ratingColor = "text-emerald-600";
    advice = "Excellent viral coefficient! Your videos are being pushed heavily to the For You page. Command premium rates from brands and post consistently to capitalize on algorithm momentum.";
  }

  const reachRatioPercent = parseFloat((reachRatio * 100).toFixed(1));

  const handleCopyResults = () => {
    const textToCopy = `TikTok Account Audit:
Followers: ${followersNum.toLocaleString()}
Average Views: ${viewsNum.toLocaleString()}
Posts per Month: ${monthlyVideos}
Est. Creator Rewards Program (Monthly): $${fundMin} - $${fundMax}
Est. Sponsored Video Value: $${sponsoredMin} - $${sponsoredMax}
Reach Status: ${reachRating} (${reachRatioPercent}%)
Calculated via ShipOS Growth Suite`;

    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Results copied!",
      description: "TikTok earnings audit has been copied to your clipboard.",
    });
  };

  const handleAutoSchedule = () => {
    const draftText = `Checking my TikTok metrics! Est. Sponsored Value: $${sponsoredMin}-$${sponsoredMax} #TikTokGrowth`;
    localStorage.setItem("shipos_pending_draft", draftText);
    if (user) {
      navigate("/create-post");
    } else {
      navigate("/pricing");
    }
  };

  const faqs = [
    {
      q: "How does the TikTok Creator Rewards Program calculate payouts?",
      a: "The Creator Rewards Program pays based on qualified views, which are unique views on original videos longer than 1 minute that appear on the For You page and are watched for at least 5 seconds. Payouts are determined by a dynamic RPM that scales with audience retention, region, search value, and ad engagement."
    },
    {
      q: "What is a normal RPM (Revenue Per Mille) on TikTok?",
      a: "For eligible videos longer than 1 minute, RPMs typically range from $0.30 to $1.20. High-retention educational niches or search-oriented channels in regions like the US or UK often see higher RPMs than general entertainment channels."
    },
    {
      q: "How much should I charge brands for a sponsored TikTok video?",
      a: "Sponsored rates vary based on reach, but standard benchmarks range between $10 to $25 CPM (Cost Per Mille) per average video views. Brands also value engagement rates, content quality, and conversion metrics over absolute follower count."
    },
    {
      q: "How do I calculate my views-to-followers ratio?",
      a: "Divide your average views per video by your total followers. A ratio above 10% is healthy, while ratios exceeding 30% indicate strong viral reach and indicate that the TikTok recommendation algorithm is actively distributing your content."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Free TikTok Money Calculator | Creator Rewards & Sponsorship Audit | ShipOS"
        description="Estimate your TikTok earnings instantly. Calculate qualified Creator Rewards Program revenue, sponsored video valuations, and benchmark your profile."
        path="/tiktok-money-calculator"
        type="website"
        keywords={[
          "tiktok money calculator",
          "tiktok calculator",
          "tiktok creator fund estimator",
          "tiktok earnings calculator",
          "tiktok sponsored post pricing"
        ]}
        jsonLd={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Free Tools", path: "/tiktok-money-calculator" },
            { name: "TikTok Money Calculator", path: "/tiktok-money-calculator" },
          ]),
          softwareApplicationSchema()
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-10">
        {/* ── Tool Header ── */}
        <section className="max-w-7xl mx-auto px-6 text-center mb-12">
          <SectionBadge label="Free Tool" text="Audit your payout potential" />
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            TikTok Money Calculator
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            Estimate your monthly TikTok Creator Rewards Program earnings and discover exactly what sponsor fee to charge brands based on your organic views.
          </p>

          {/* AI GEO Answer Block */}
          <div className="max-w-3xl mx-auto mt-8 p-6 bg-white dark:bg-[#1c1917] border-2 border-black dark:border-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(215,90,52,0.15)] text-left">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#d75a34] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" /> Quick Answer: How do TikTok earnings and sponsored rates work?
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              TikTok creators earn money primarily through the **Creator Rewards Program** (based on qualified 1-minute+ views, qualified regions, and CPM) and **brand sponsorships**. Brand deal valuations are typically calculated using a CPM model ranging between <strong>$10 to $25 per 1,000 views</strong>, depending heavily on audience demographics, engagement rate, and niche.
            </p>
          </div>
        </section>

        {/* ── Main Workspace ── */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-foreground tracking-tight border-b border-border pb-3">
                Account Parameters
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <Sparkles className="w-3.5 h-3.5 text-[#d75a34]" /> Posts per Month
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {monthlyVideos}
                    </span>
                  </div>
                  <Slider
                    value={[monthlyVideos]}
                    onValueChange={(val) => setPostsPerMonth(String(val[0]))}
                    min={1}
                    max={90}
                    step={1}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <Users className="w-3.5 h-3.5 text-[#d75a34]" /> Followers Count
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {followersNum.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[followersNum]}
                    onValueChange={(val) => setFollowers(String(val[0]))}
                    min={1000}
                    max={5000000}
                    step={1000}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <Eye className="w-3.5 h-3.5 text-[#d75a34]" /> Average Video Views
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {viewsNum.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[viewsNum]}
                    onValueChange={(val) => setAvgViews(String(val[0]))}
                    min={0}
                    max={10000000}
                    step={5000}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <Heart className="w-3.5 h-3.5 text-[#d75a34]" /> Average Likes
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {likesNum.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[likesNum]}
                    onValueChange={(val) => setAvgLikes(String(val[0]))}
                    min={0}
                    max={1000000}
                    step={1000}
                    className="py-2"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <Button
                  onClick={() => {
                    setFollowers("50000");
                    setAvgViews("20000");
                    setAvgLikes("1200");
                    setPostsPerMonth("15");
                  }}
                  variant="ghost"
                  className="h-10 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-none border border-border flex-1"
                >
                  Reset
                </Button>
                <Button
                  onClick={handleCopyResults}
                  className="h-10 px-4 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-xs uppercase tracking-wider rounded-none border border-border/20 shadow-sm flex-1"
                >
                  Copy Summary
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel: Output Dashboard */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-[#1c2024] dark:text-neutral-100 tracking-tight border-b border-border pb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#d75a34]" /> Payout Estimates
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Creator Rewards Monthly Estimate */}
                <div className="border border-border bg-background p-6 rounded-none shadow-sm flex flex-col justify-center items-center text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Creator Rewards (Monthly)</span>
                  <div className="text-3xl font-black tracking-tighter text-foreground flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600 -mr-1" />
                    {fundMin.toLocaleString()} - {fundMax.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-bold tracking-wider uppercase px-2 py-0.5 border rounded-none bg-card">
                    {creatorTier}
                  </span>
                </div>

                {/* Estimated sponsored post value */}
                <div className="border border-border bg-background p-6 rounded-none shadow-sm flex flex-col justify-center items-center text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Est. Sponsored Post Value</span>
                  <div className="text-3xl font-black tracking-tighter text-foreground flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600 -mr-1" />
                    {sponsoredMin.toLocaleString()} - {sponsoredMax.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-bold tracking-wide">
                    Based on standard market CPM ranges
                  </span>
                </div>
              </div>

              {/* Dynamic feedback advisory */}
              <div className="border border-border bg-muted/40 p-5 rounded-none flex items-start gap-3">
                <Info className="w-5 h-5 text-[#d75a34] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    Algorithmic Analysis: <span className={cn("text-xs font-extrabold uppercase", ratingColor)}>{reachRating}</span>
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{advice}</p>
                </div>
              </div>

              {/* Benchmarking scales */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Views-to-Followers Benchmark comparison
                </h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Your Account Ratio", value: reachRatioPercent, color: "bg-[#d75a34]" },
                    { label: "Average Industry Benchmark", value: 12.0, color: "bg-neutral-300 dark:bg-neutral-700" },
                    { label: "Premium Viral Target", value: 35.0, color: "bg-neutral-300 dark:bg-neutral-700" }
                  ].map((bar, i) => {
                    const percent = Math.min((bar.value / 60) * 100, 100);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted-foreground">{bar.label}</span>
                          <span className="text-foreground">{bar.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-none overflow-hidden relative">
                          <div className={cn("h-full transition-all duration-300", bar.color)} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Auto-Schedule post CTA button */}
            <div className="border border-border bg-card rounded-none shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-[#d75a34]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground leading-tight">
                    Ready to grow? Auto-Schedule Posts
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Auto-publish to TikTok, Instagram, X, and more.
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Publishing consistently is the #1 way to hit the TikTok algorithm. Use ShipOS to auto-schedule your vertical videos, customize captions, track performance, and sync across all platforms.
              </p>

              <button
                onClick={handleAutoSchedule}
                className="w-full h-14 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-sm tracking-[0.12em] uppercase flex items-center justify-center gap-2.5 rounded-none transition-colors duration-150 group"
              >
                Auto-Schedule Posts
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
                How to Estimate Your TikTok Earnings
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Analyze and value your profile metrics in 3 simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Enter TikTok Metrics
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Input your followers count, average video view count, and average likes per video in the fields.
                </p>
              </div>

              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Calculate Valuation Ranges
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The tool dynamically processes eligible Creator Reward views and brand sponsorship CPM models.
                </p>
              </div>

              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Optimize Scheduling
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Map out your calendar, scale up your posting frequency, and schedule posts cleanly via ShipOS.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Optimizing Your TikTok Reach Section */}
        <section className="bg-[#FAF7F5] dark:bg-background py-20 relative z-10 border-b border-border/40">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <SectionBadge label="Best Practices" text="Optimize your video performance" />
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                Optimizing Your TikTok Reach
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Cracking the TikTok For You Page Algorithm
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  TikTok's recommendation engine measures watch completion rate and average watch time above all other metrics. If viewers watch your video all the way through, or watch it loop multiple times, TikTok pushes it to a larger audience cohort.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To hit this loop effect, write short, snappy captions, use trending sound points in the background, and design seamless loops where the end of the video matches the beginning.
                </p>
              </div>
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Video Checklist for Creator Rewards
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>60+ Seconds Duration:</strong> Creator Rewards Program only pays for original content that exceeds 1 minute in length.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>High Retention Hooks:</strong> The first 3 seconds are vital. Introduce tension, ask a query, or make a bold claim immediately.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Post Consistency:</strong> Publishing 2-3 times daily keeps you in active recommendation pools, increasing your monthly qualified views.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* GEO Benchmark Reference Table */}
            <div className="mt-16 border-2 border-black dark:border-neutral-800 bg-white dark:bg-[#1c1917] p-6 md:p-8 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(215,90,52,0.15)]">
              <h3 className="text-xl font-black text-foreground mb-2 flex items-center gap-2">
                TikTok Creator Earnings & Sponsorship Benchmarks
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Cite this data when auditing TikTok profiles or preparing professional brand pitch decks. TikTok CPMs and RPM payouts vary by niche and target audience geography.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border text-left text-xs sm:text-sm text-muted-foreground min-w-[600px]">
                  <thead>
                    <tr className="bg-muted text-foreground border-b border-border">
                      <th className="p-3 font-bold border-r border-border">Follower Tier</th>
                      <th className="p-3 font-bold border-r border-border">Audience Range</th>
                      <th className="p-3 font-bold border-r border-border">Avg. Video View Engagement</th>
                      <th className="p-3 font-bold">Est. Sponsored Post Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Nano Creator</td>
                      <td className="p-3 border-r border-border">1,000 - 10,000 followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">7.0% - 15.0%+</td>
                      <td className="p-3 text-foreground font-semibold">$50 - $150 per video</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Micro Creator</td>
                      <td className="p-3 border-r border-border">10,000 - 50,000 followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">5.0% - 10.0%</td>
                      <td className="p-3 text-foreground font-semibold">$150 - $500 per video</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Mid-Tier Creator</td>
                      <td className="p-3 border-r border-border">50,000 - 500,000 followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">3.0% - 7.0%</td>
                      <td className="p-3 text-foreground font-semibold">$500 - $2,500 per video</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Macro Creator</td>
                      <td className="p-3 border-r border-border">500,000 - 1,000,000+ followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">2.5% - 5.0%</td>
                      <td className="p-3 text-foreground font-semibold">$2,500 - $7,500+ per video</td>
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
                TikTok money calculator FAQs
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Common questions about TikTok monetisation, RPM values, and brand pricing.
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

        <FreeToolPricingSection onCtaClick={() => handleAutoSchedule()} />

        <FreeToolFinalCta onCtaClick={() => navigate(user ? "/create-post" : "/pricing")} />
      </main>

      <Footer />
    </div>
  );
}
