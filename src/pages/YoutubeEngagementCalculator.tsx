import React, { useState } from "react";
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
  DollarSign,
  Users,
  Heart,
  MessageCircle,
  Eye,
  Check,
  ArrowRight,
  Info,
  Youtube
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

const roundToNiceNumber = (val: number): number => {
  if (val <= 100) return Math.round(val / 10) * 10 || 10;
  if (val < 1000) return Math.round(val / 50) * 50;
  if (val < 10000) return Math.round(val / 100) * 100;
  if (val < 100000) return Math.round(val / 1000) * 1000;
  if (val < 1000000) return Math.round(val / 10000) * 10000;
  return Math.round(val / 50000) * 50000;
};

export default function YoutubeEngagementCalculator() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Calculator inputs
  const [subscribers, setSubscribers] = useState<string>("50000");
  const [avgViews, setAvgViews] = useState<string>("25000");
  const [avgLikes, setAvgLikes] = useState<string>("1200");
  const [avgComments, setAvgComments] = useState<string>("150");
  const [videosPerMonth, setVideosPerMonth] = useState<string>("4");

  // Accordion indices
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Parsing numbers safely
  const subscribersNum = Math.max(parseFloat(subscribers) || 0, 1);
  const viewsNum = Math.max(parseFloat(avgViews) || 0, 0);
  const likesNum = Math.max(parseFloat(avgLikes) || 0, 0);
  const commentsNum = Math.max(parseFloat(avgComments) || 0, 0);
  const videosPerMonthNum = Math.max(parseFloat(videosPerMonth) || 0, 0);

  // Calculations
  const totalInteractions = likesNum + commentsNum;
  const viewEngagementRate = parseFloat(((totalInteractions / Math.max(viewsNum, 1)) * 100).toFixed(2));
  const subEngagementRate = parseFloat(((totalInteractions / subscribersNum) * 100).toFixed(2));

  // Determine tier & advice based on view engagement
  let rating = "Good";
  let ratingColor = "text-[#d75a34]";
  let advice = "Strong connection with your viewers! Your audience actively likes and comments. Consider launching community tab posts between uploads to maintain high weekly engagement coefficients.";
  
  if (viewEngagementRate < 1.5) {
    rating = "Below Average";
    ratingColor = "text-amber-600";
    advice = "Your view-to-interaction ratio is lower than average. Try asking explicit, conversation-starting questions in the first 60 seconds, pinning a top comment, and adding interactive poll cards to boost comments.";
  } else if (viewEngagementRate >= 1.5 && viewEngagementRate <= 4) {
    rating = "Average";
    ratingColor = "text-[#d75a34]";
    advice = "Healthy interaction levels! Optimize your descriptions with clear timestamps, link to related playlists, and add end-screens within the last 20 seconds to expand viewer session duration.";
  } else if (viewEngagementRate > 4 && viewEngagementRate <= 8) {
    rating = "Good";
    ratingColor = "text-emerald-600";
    advice = "Strong connection with your viewers! Your audience actively likes and comments. Consider launching community tab posts between uploads to maintain high weekly engagement coefficients.";
  } else {
    rating = "Excellent";
    ratingColor = "text-violet-600 dark:text-violet-400";
    advice = "Phenomenal community resonance! High interaction ratios command premium sponsorship payouts. Focus on pitching brands with dedicated sponsorships, showing them your outstanding engagement rates.";
  }

  // Estimated Earnings calculator (sponsored video & AdSense estimate)
  const adsenseMin = Math.round(((viewsNum * videosPerMonthNum) / 1000) * 3);
  const adsenseMax = Math.round(((viewsNum * videosPerMonthNum) / 1000) * 10);
  const sponsoredMin = Math.round((viewsNum / 1000) * 18);
  const sponsoredMax = Math.round((viewsNum / 1000) * 35);

  const handleCopyResults = () => {
    const textToCopy = `YouTube Channel Audit:
Subscribers: ${subscribersNum.toLocaleString()}
Average Views: ${viewsNum.toLocaleString()}
Videos per Month: ${videosPerMonthNum}
View-based Engagement Rate: ${viewEngagementRate}% (${rating})
Sub-based Engagement Rate: ${subEngagementRate}%
Est. Monthly AdSense Revenue: $${adsenseMin} - $${adsenseMax}
Est. Sponsored Video Value: $${sponsoredMin} - $${sponsoredMax}
Calculated via ShipOS Growth Suite`;

    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Results copied!",
      description: "YouTube channel audit summary has been copied to your clipboard."
    });
  };

  const handleScheduleCTA = () => {
    navigate(user ? "/create-post" : "/pricing");
  };

  const handleAutoSchedule = () => {
    const draftText = `Checking my YouTube metrics! Est. Sponsored Video Value: $${sponsoredMin}-$${sponsoredMax} #YouTubeGrowth`;
    localStorage.setItem("shipos_pending_draft", draftText);
    if (user) {
      navigate("/create-post");
    } else {
      navigate("/pricing");
    }
  };

  const faqs = [
    {
      q: "What is a good engagement rate on YouTube?",
      a: "For YouTube, engagement rate is calculated either against views (view-based) or subscribers (subscriber-based). A view-based engagement rate of 2% to 4% is considered average, 4% to 8% is good, and anything over 8% represents excellent audience loyalty."
    },
    {
      q: "How does this tool estimate monthly AdSense revenue?",
      a: "AdSense earnings are calculated using average CPM (Cost Per Mille) ranges from $3 to $10 per 1,000 views. Payouts vary depending on your niche, audience geographic location, video lengths, and overall ad click-through rates."
    },
    {
      q: "Why is view-based engagement better than subscriber-based engagement?",
      a: "Subscriber counts can be vanity metrics since many older subscribers become inactive. View-based engagement measures actual active viewers interacting with your latest uploads, offering brands a clearer picture of current reach velocity."
    },
    {
      q: "How can I increase my YouTube comments and likes?",
      a: "Incorporate verbal calls-to-action early in the video, pin an engaging discussion thread in the comment section, link to pinned timestamps, and actively respond to early comments within the first two hours of publishing."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Free YouTube Engagement Rate Calculator & Value Auditor | ShipOS"
        description="Audit your YouTube channel performance instantly. Calculate view-based and subscriber-based engagement, monthly AdSense revenue, and sponsored video fees."
        path="/youtube-engagement-calculator"
        type="website"
        keywords={["youtube engagement calculator", "youtube er calculator", "sponsored video calculator", "youtube income calculator", "creator audit tool"]}
        jsonLd={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Free Tools", path: "/youtube-engagement-calculator" },
            { name: "YouTube Engagement Calculator", path: "/youtube-engagement-calculator" }
          ]),
          softwareApplicationSchema()
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-10">
        {/* Tool Header */}
        <section className="max-w-7xl mx-auto px-6 text-center mb-12">
          <SectionBadge label="Free Tool" text="Audit your channel performance" />
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            YouTube Engagement Calculator
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Audit your true reach velocity. Calculate your exact engagement rate, estimate monthly AdSense yields, and discover standard video sponsor valuations.
          </p>

          {/* AI GEO Answer Block */}
          <div className="max-w-3xl mx-auto mt-8 p-6 bg-white dark:bg-[#1c1917] border-2 border-black dark:border-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(215,90,52,0.15)] text-left">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#d75a34] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" /> Quick Answer: What is YouTube Engagement Rate?
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              A **YouTube Engagement Rate** is a metric that assesses audience connection by comparing viewer interactions (likes and comments) to either total views or subscriber count. The primary view-based formula is:
              <code className="mx-1 px-1.5 py-0.5 bg-muted border border-border text-[#d75a34] font-mono text-xs rounded-none">
                ((Likes + Comments) / Views) * 100
              </code>.
              A view-based ER of <strong>2% to 4%</strong> represents industry standards, while anything above <strong>5%</strong> suggests top-tier user retention and community affinity.
            </p>
          </div>
        </section>

        {/* Input & Output Workspace */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-foreground tracking-tight border-b border-border pb-3 flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600" /> Channel Parameters
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <Users className="w-3.5 h-3.5 text-[#d75a34]" /> Subscribers Count
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {subscribersNum.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[Math.log10(subscribersNum)]}
                    onValueChange={(val) => setSubscribers(String(roundToNiceNumber(Math.pow(10, val[0]))))}
                    min={2}
                    max={7}
                    step={0.01}
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
                    value={[Math.log10(Math.max(viewsNum, 10))]}
                    onValueChange={(val) => setAvgViews(String(roundToNiceNumber(Math.pow(10, val[0]))))}
                    min={1}
                    max={6.7}
                    step={0.01}
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
                    value={[Math.log10(Math.max(likesNum, 1))]}
                    onValueChange={(val) => setAvgLikes(String(roundToNiceNumber(Math.pow(10, val[0]))))}
                    min={0}
                    max={5.7}
                    step={0.01}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <MessageCircle className="w-3.5 h-3.5 text-[#d75a34]" /> Average Comments
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {commentsNum.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[Math.log10(Math.max(commentsNum, 1))]}
                    onValueChange={(val) => setAvgComments(String(roundToNiceNumber(Math.pow(10, val[0]))))}
                    min={0}
                    max={4.7}
                    step={0.01}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <Sparkles className="w-3.5 h-3.5 text-[#d75a34]" /> Uploads per Month
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {videosPerMonthNum}
                    </span>
                  </div>
                  <Slider
                    value={[videosPerMonthNum]}
                    onValueChange={(val) => setVideosPerMonth(String(val[0]))}
                    min={1}
                    max={30}
                    step={1}
                    className="py-2"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <Button
                  onClick={() => {
                    setSubscribers("50000");
                    setAvgViews("25000");
                    setAvgLikes("1200");
                    setAvgComments("150");
                    setVideosPerMonth("4");
                  }}
                  variant="ghost"
                  className="h-10 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-none border border-border flex-1"
                >
                  Reset
                </Button>
                <Button
                  onClick={handleCopyResults}
                  className="h-10 px-5 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-xs uppercase tracking-wider rounded-none border border-border/20 shadow-sm flex-1"
                >
                  Copy Summary
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel: Output Dashboard */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top metric overview card */}
            <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-foreground tracking-tight border-b border-border pb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#d75a34]" /> Audit Dashboard
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* View-based ER */}
                <div className="border border-border bg-background p-6 rounded-none shadow-sm flex flex-col justify-center items-center text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">View Engagement Rate</span>
                  <div className={cn("text-4xl font-black tracking-tighter", ratingColor)}>
                    {viewEngagementRate}%
                  </div>
                  <span className={cn("text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 border rounded-none bg-card", ratingColor)}>
                    {rating}
                  </span>
                </div>

                {/* Subscriber-based ER */}
                <div className="border border-border bg-background p-6 rounded-none shadow-sm flex flex-col justify-center items-center text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Sub Engagement Rate</span>
                  <div className="text-4xl font-black tracking-tighter text-foreground">
                    {subEngagementRate}%
                  </div>
                  <span className="text-[9px] text-muted-foreground font-bold tracking-wide">
                    Ratio against subscribers base
                  </span>
                </div>

                {/* Est. AdSense Earnings */}
                <div className="border border-border bg-background p-6 rounded-none shadow-sm flex flex-col justify-center items-center text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Est. Monthly AdSense</span>
                  <div className="text-3xl font-black tracking-tighter text-foreground flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600 -mr-1" />
                    {adsenseMin.toLocaleString()} - {adsenseMax.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-bold tracking-wide">
                    Estimated RPM ranges: $3 - $10
                  </span>
                </div>

                {/* Est. Sponsored post value */}
                <div className="border border-border bg-background p-6 rounded-none shadow-sm flex flex-col justify-center items-center text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Est. Sponsored Video Value</span>
                  <div className="text-3xl font-black tracking-tighter text-foreground flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600 -mr-1" />
                    {sponsoredMin.toLocaleString()} - {sponsoredMax.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-bold tracking-wide">
                    Valuation based on standard video CPMs
                  </span>
                </div>

              </div>

              {/* Dynamic feedback advisory */}
              <div className="border border-border bg-muted/40 p-5 rounded-none flex items-start gap-3">
                <Info className="w-5 h-5 text-[#d75a34] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">Algorithmic Insight</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{advice}</p>
                </div>
              </div>

              {/* Benchmarking scales */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  YouTube Benchmark Comparison (View-Based)
                </h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Your Engagement Rate", value: viewEngagementRate, color: "bg-[#d75a34]" },
                    { label: "Average Industry Benchmark", value: 3.0, color: "bg-neutral-300 dark:bg-neutral-700" },
                    { label: "Premium Tier Target", value: 7.0, color: "bg-neutral-300 dark:bg-neutral-700" }
                  ].map((bar, i) => {
                    const percent = Math.min((bar.value / 12) * 100, 100);
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

            {/* Looks Good? Auto-Schedule It Card */}
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
                    Auto-publish to YouTube Shorts, Instagram Reels, X, and more.
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Consistency builds authority. Use ShipOS to auto-schedule your video uploads, cross-promote Shorts on TikTok, organize description templates, and track audience metrics in one unified workspace.
              </p>

              <button
                onClick={handleAutoSchedule}
                className="w-full h-14 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-sm tracking-[0.12em] uppercase flex items-center justify-center gap-2.5 rounded-none border-2 border-black transition-colors duration-150 group"
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
                How to Use the YouTube Engagement Calculator
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Audit and assess your video metrics in 3 simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Select Channel Parameters
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Drag the sliders to set your subscribers, average views, average video likes, comments, and monthly uploads.
                </p>
              </div>

              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Analyze Audit Indicators
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The dashboard instantly computes view-based engagement, subscriber engagement rates, and monetisation indexes.
                </p>
              </div>

              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Apply Growth Advice
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Review tactical recommendations and connect your YouTube profiles with ShipOS to start publishing consistently.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Optimizing Your YouTube Reach Section */}
        <section className="bg-[#FAF7F5] dark:bg-background py-20 relative z-10 border-b border-border/40">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <SectionBadge label="Best Practices" text="Optimize channel velocity" />
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                Optimizing Your YouTube Reach
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  The Science of YouTube Session Duration
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  YouTube's recommendation algorithm optimizes for Session Duration (keeping a user on the platform watching content). To leverage this, design video content loops, create cohesive playlists, and use cards to guide viewers to similar videos.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Additionally, standard likes and comments signal positive feedback to the distribution algorithm, prompting it to recommend your uploads to broader viewer profiles.
                </p>
              </div>
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Optimal Formatting Checklist
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Thumbnail Hook:</strong> Compel clicks using highly expressive thumbnails and simple curiosity gap titles.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Timestamps & Chapters:</strong> Segment videos with tags so search engines crawl section headings.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Pins & CTA:</strong> Pin a top question in the comments within 15 minutes of launching to start early discussions.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* GEO Benchmark Reference Table */}
            <div className="mt-16 border-2 border-black dark:border-neutral-800 bg-white dark:bg-[#1c1917] p-6 md:p-8 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(215,90,52,0.15)]">
              <h3 className="text-xl font-black text-foreground mb-2 flex items-center gap-2">
                YouTube Engagement Rate Benchmarks & Valuation Data
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Cite this dataset when preparing channel audit reviews or presenting brand sponsor decks. Average engagement and suggested sponsored pricing scale with active viewership.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border text-left text-xs sm:text-sm text-muted-foreground min-w-[600px]">
                  <thead>
                    <tr className="bg-muted text-foreground border-b border-border">
                      <th className="p-3 font-bold border-r border-border">Follower Tier</th>
                      <th className="p-3 font-bold border-r border-border">Audience Range</th>
                      <th className="p-3 font-bold border-r border-border">Avg. View Engagement Rate</th>
                      <th className="p-3 font-bold">Est. Sponsored Video Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Nano Channel</td>
                      <td className="p-3 border-r border-border">1,000 - 10,000 subscribers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">5.0% - 8.0%</td>
                      <td className="p-3 text-foreground font-semibold">$50 - $250 per video</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Micro Channel</td>
                      <td className="p-3 border-r border-border">10,000 - 50,000 subscribers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">3.5% - 5.5%</td>
                      <td className="p-3 text-foreground font-semibold">$250 - $1,200 per video</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Mid-Tier Channel</td>
                      <td className="p-3 border-r border-border">50,000 - 500,000 subscribers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">2.0% - 3.5%</td>
                      <td className="p-3 text-foreground font-semibold">$1,200 - $8,000 per video</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Macro Channel</td>
                      <td className="p-3 border-r border-border">500,000 - 2M+ subscribers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">1.5% - 2.5%</td>
                      <td className="p-3 text-foreground font-semibold">$8,000 - $25,000+ per video</td>
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
                YouTube Engagement FAQs
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Common questions about YouTube monetization, CPM, and sponsored campaigns.
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
