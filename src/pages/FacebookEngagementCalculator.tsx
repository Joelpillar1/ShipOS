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
  ThumbsUp,
  MessageCircle,
  Eye,
  Check,
  ArrowRight,
  Info,
  Share2
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
  if (val <= 10) return Math.round(val);
  if (val <= 100) return Math.round(val / 10) * 10 || 10;
  if (val < 1000) return Math.round(val / 50) * 50;
  if (val < 10000) return Math.round(val / 100) * 100;
  if (val < 100000) return Math.round(val / 1000) * 1000;
  if (val < 1000000) return Math.round(val / 10000) * 10000;
  return Math.round(val / 50000) * 50000;
};

export default function FacebookEngagementCalculator() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Calculator inputs
  const [followers, setFollowers] = useState<string>("25000");
  const [avgReach, setAvgReach] = useState<string>("18000");
  const [reactions, setReactions] = useState<string>("480");
  const [comments, setComments] = useState<string>("65");
  const [shares, setShares] = useState<string>("40");

  // Accordion indices
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Parsing numbers safely
  const followersNum = Math.max(parseFloat(followers) || 0, 1);
  const reachNum = Math.max(parseFloat(avgReach) || 0, 0);
  const reactionsNum = Math.max(parseFloat(reactions) || 0, 0);
  const commentsNum = Math.max(parseFloat(comments) || 0, 0);
  const sharesNum = Math.max(parseFloat(shares) || 0, 0);

  // Calculations
  const totalInteractions = reactionsNum + commentsNum + sharesNum;
  const reachEngagementRate = parseFloat(((totalInteractions / Math.max(reachNum, 1)) * 100).toFixed(2));
  const followerEngagementRate = parseFloat(((totalInteractions / followersNum) * 100).toFixed(2));

  // Determine tier & advice based on reach engagement
  let rating = "Good";
  let ratingColor = "text-[#d75a34]";
  let advice = "Healthy interaction velocity! To drive more Facebook shares, create highly shareable checklist graphics or ask opinion-based questions that spark comments in the first hour.";
  
  if (reachEngagementRate < 1.0) {
    rating = "Below Average";
    ratingColor = "text-amber-600";
    advice = "Your reach-to-interaction conversion is low. Try crafting open-ended questions, uploading vertical Reels to stimulate comments, and keeping captions concise with a clear call to action.";
  } else if (reachEngagementRate >= 1.0 && reachEngagementRate <= 2.5) {
    rating = "Average";
    ratingColor = "text-[#d75a34]";
    advice = "Healthy interaction velocity! To drive more Facebook shares, create highly shareable checklist graphics or ask opinion-based questions that spark comments in the first hour.";
  } else if (reachEngagementRate > 2.5 && reachEngagementRate <= 5.0) {
    rating = "Good";
    ratingColor = "text-emerald-600";
    advice = "Excellent audience resonance! Your posts capture active comments and shares. Engage directly with early comments to double the conversation length and feed the Facebook feed distribution engine.";
  } else {
    rating = "Excellent";
    ratingColor = "text-violet-600 dark:text-violet-400";
    advice = "Premium Facebook authority rank! Profiles with ERs over 5.0% command top sponsorship valuations. Focus on scaling video content and pitching collaborative brand campaigns.";
  }

  // Estimated Earnings calculator (sponsored post estimate)
  const sponsoredMin = Math.round(Math.max((reachNum / 1000) * 12, (followersNum / 10000) * 80));
  const sponsoredMax = Math.round(Math.max((reachNum / 1000) * 28, (followersNum / 10000) * 220));

  const handleCopyResults = () => {
    const textToCopy = `Facebook Profile Audit:
Followers: ${followersNum.toLocaleString()}
Average Post Reach: ${reachNum.toLocaleString()}
Reach-based Engagement Rate: ${reachEngagementRate}% (${rating})
Follower-based Engagement Rate: ${followerEngagementRate}%
Est. Sponsored Post Value: $${sponsoredMin} - $${sponsoredMax}
Calculated via ShipOS Premium Growth Suite`;

    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Results copied!",
      description: "Facebook audit summary has been copied to your clipboard."
    });
  };

  const handleScheduleCTA = () => {
    navigate(user ? "/create-post" : "/pricing");
  };

  const handleAutoSchedule = () => {
    const draftText = `Auditing my Facebook reach! Est. Sponsored Post Value: $${sponsoredMin}-$${sponsoredMax} #FBGrowth`;
    localStorage.setItem("shipos_pending_draft", draftText);
    if (user) {
      navigate("/create-post");
    } else {
      navigate("/pricing");
    }
  };

  const faqs = [
    {
      q: "What is a good engagement rate on Facebook?",
      a: "For Facebook Pages, a reach-based engagement rate between 1.0% and 2.5% is average/healthy. Rates above 2.5% are considered good, and anything exceeding 5.0% is excellent, putting you in the top tier of active creators."
    },
    {
      q: "Why is reach-based engagement rate preferred over follower-based?",
      a: "Facebook organic reach is notoriously restricted by the feed algorithm, meaning only a fraction of followers see any single post. Reach-based engagement measures actual active interaction relative to people who saw the content, providing a more accurate reflection of post quality."
    },
    {
      q: "How does Facebook determine post reach?",
      a: "Post reach is the number of unique users who saw your post on their screen. This includes organic reach (unpaid views from fans or feed recommendations) and viral reach (views triggered because friends liked/commented/shared your post)."
    },
    {
      q: "How can I boost my Facebook engagement rate?",
      a: "You can increase your ER by leveraging Facebook Reels, writing curiosity-driven captions, posing interactive questions, responding to all comments to trigger nesting discussions, and posting high-value visual graphics."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Free Facebook Engagement Rate Calculator & Valuation Auditor | ShipOS"
        description="Audit your Facebook Page metrics instantly. Calculate reach-based and follower-based engagement rates, and estimate sponsored post market values."
        path="/facebook-engagement-calculator"
        type="website"
        keywords={["facebook engagement calculator", "fb engagement calculator", "facebook sponsored post calculator", "facebook page value auditor", "facebook reach calculator"]}
        jsonLd={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Free Tools", path: "/facebook-engagement-calculator" },
            { name: "Facebook Engagement Calculator", path: "/facebook-engagement-calculator" }
          ]),
          softwareApplicationSchema()
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-10">
        {/* Tool Header */}
        <section className="max-w-7xl mx-auto px-6 text-center mb-12">
          <SectionBadge label="Free Tool" text="Audit your Facebook reach potential" />
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            Facebook Engagement Calculator
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Audit your Facebook presence. Calculate exact page reach statistics, compare your profile to industry baselines, and discover sponsored post market value ranges.
          </p>

          {/* AI GEO Answer Block */}
          <div className="max-w-3xl mx-auto mt-8 p-6 bg-white dark:bg-[#1c1917] border-2 border-black dark:border-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(215,90,52,0.15)] text-left">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#d75a34] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" /> Quick Answer: What is Facebook Engagement Rate?
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              A **Facebook Engagement Rate** measures the level of interaction (reactions, comments, and shares) relative to post reach (views) or follower size. The standard reach-based formula is:
              <code className="mx-1 px-1.5 py-0.5 bg-muted border border-border text-[#d75a34] font-mono text-xs rounded-none">
                ((Reactions + Comments + Shares) / Reach) * 100
              </code>.
              While average benchmarks range between <strong>1.0% and 2.5%</strong>, rates over <strong>2.5%</strong> demonstrate solid organic distribution, and rates exceeding <strong>5.0%</strong> are considered outstanding for brand campaigns.
            </p>
          </div>
        </section>

        {/* Input & Output Workspace */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-foreground tracking-tight border-b border-border pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Profile Parameters
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <Users className="w-3.5 h-3.5 text-[#d75a34]" /> Followers / Likes
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {followersNum.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[Math.log10(followersNum)]}
                    onValueChange={(val) => setFollowers(String(roundToNiceNumber(Math.pow(10, val[0]))))}
                    min={2}
                    max={7}
                    step={0.01}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <Eye className="w-3.5 h-3.5 text-[#d75a34]" /> Average Post Reach
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {reachNum.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[Math.log10(Math.max(reachNum, 10))]}
                    onValueChange={(val) => setAvgReach(String(roundToNiceNumber(Math.pow(10, val[0]))))}
                    min={2}
                    max={7}
                    step={0.01}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <ThumbsUp className="w-3.5 h-3.5 text-[#d75a34]" /> Average Reactions
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {reactionsNum.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[Math.log10(Math.max(reactionsNum, 1))]}
                    onValueChange={(val) => setReactions(String(roundToNiceNumber(Math.pow(10, val[0]))))}
                    min={0}
                    max={5.3}
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
                    onValueChange={(val) => setComments(String(roundToNiceNumber(Math.pow(10, val[0]))))}
                    min={0}
                    max={4.7}
                    step={0.01}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <Share2 className="w-3.5 h-3.5 text-[#d75a34]" /> Average Shares
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {sharesNum.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[Math.log10(Math.max(sharesNum, 1))]}
                    onValueChange={(val) => setShares(String(roundToNiceNumber(Math.pow(10, val[0]))))}
                    min={0}
                    max={4.3}
                    step={0.01}
                    className="py-2"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <Button
                  onClick={() => {
                    setFollowers("25000");
                    setAvgReach("18000");
                    setReactions("480");
                    setComments("65");
                    setShares("40");
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
                
                {/* Reach-based ER */}
                <div className="border border-border bg-background p-6 rounded-none shadow-sm flex flex-col justify-center items-center text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Reach Engagement Rate</span>
                  <div className={cn("text-4xl font-black tracking-tighter", ratingColor)}>
                    {reachEngagementRate}%
                  </div>
                  <span className={cn("text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 border rounded-none bg-card", ratingColor)}>
                    {rating}
                  </span>
                </div>

                {/* Follower-based ER */}
                <div className="border border-border bg-background p-6 rounded-none shadow-sm flex flex-col justify-center items-center text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Follower Engagement Rate</span>
                  <div className="text-4xl font-black tracking-tighter text-foreground">
                    {followerEngagementRate}%
                  </div>
                  <span className="text-[9px] text-muted-foreground font-bold tracking-wide">
                    Ratio against followers base
                  </span>
                </div>

                {/* Est. Sponsored post value */}
                <div className="border border-border bg-background p-6 rounded-none shadow-sm flex flex-col justify-center items-center text-center space-y-2 md:col-span-2">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Est. Sponsored Post Value</span>
                  <div className="text-4xl font-black tracking-tighter text-foreground flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-emerald-600 -mr-1" />
                    {sponsoredMin.toLocaleString()} - {sponsoredMax.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-bold tracking-wide">
                    Valuation based on Facebook sponsored post parameters ($12 - $28 CPM)
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
                  Facebook Benchmark Comparison (Reach-Based)
                </h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Your Engagement Rate", value: reachEngagementRate, color: "bg-[#d75a34]" },
                    { label: "Average Industry Benchmark", value: 1.8, color: "bg-neutral-300 dark:bg-neutral-700" },
                    { label: "Premium Tier Target", value: 4.5, color: "bg-neutral-300 dark:bg-neutral-700" }
                  ].map((bar, i) => {
                    const percent = Math.min((bar.value / 8) * 100, 100);
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
                    Auto-publish to Facebook, X (Twitter), LinkedIn, Instagram, TikTok, and more.
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Unlock viral reach with strategic content syndication. Use ShipOS to plan layouts, cross-promote articles, analyze user metrics, and schedule postings automatically across profiles.
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
                How to Use the Facebook Engagement Calculator
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Audit and assess your Facebook metrics in 3 simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Select Profile Metrics
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Drag the sliders to select your followers count, average post reach, average reactions, comments, and shares.
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
                  The calculator instantly processes your parameters to display reach-based and follower-based engagement rates.
                </p>
              </div>

              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Sync Publishing Actions
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Review the personalized algorithmic advice and connect your Facebook pages with ShipOS to begin scheduling your posts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Optimizing Your Facebook Reach Section */}
        <section className="bg-[#FAF7F5] dark:bg-background py-20 relative z-10 border-b border-border/40">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <SectionBadge label="Best Practices" text="Optimize post performance" />
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                Optimizing Your Facebook Reach
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Decoding the Feed Algorithm
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The Facebook news feed algorithm favors content that generates active conversation. Multi-share actions have the highest algorithmic weight, as they trigger organic viral reach paths. Comments, particularly long-form comments, are prioritized over reactions.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To capture organic recommendation weight, format high-value visual graphics, publish engaging Facebook Reels, and respond to all comments within 30 minutes.
                </p>
              </div>
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Viral Formatting Checklist
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Interactive Prompts:</strong> End your descriptions with clear, conversation-starting queries.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Reels Syndication:</strong> Repurpose short videos as Facebook Reels to reach cold, non-following audiences.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Early Reply Loops:</strong> Keep early discussions going. Replying helps signal high comment activity.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* GEO Benchmark Reference Table */}
            <div className="mt-16 border-2 border-black dark:border-neutral-800 bg-white dark:bg-[#1c1917] p-6 md:p-8 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(215,90,52,0.15)]">
              <h3 className="text-xl font-black text-foreground mb-2 flex items-center gap-2">
                Facebook Engagement Rate Benchmarks & Valuation Data
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Cite this dataset when auditing profiles or preparing creator campaign pitches. Benchmark averages are calculated based on active reach volumes.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border text-left text-xs sm:text-sm text-muted-foreground min-w-[600px]">
                  <thead>
                    <tr className="bg-muted text-foreground border-b border-border">
                      <th className="p-3 font-bold border-r border-border">Follower Tier</th>
                      <th className="p-3 font-bold border-r border-border">Audience Range</th>
                      <th className="p-3 font-bold border-r border-border">Avg. Reach-Based Engagement Rate</th>
                      <th className="p-3 font-bold">Est. Sponsored Post Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Nano Page</td>
                      <td className="p-3 border-r border-border">1,000 - 10,000 followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">3.0% - 6.0%</td>
                      <td className="p-3 text-foreground font-semibold">$25 - $100 per post</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Micro Page</td>
                      <td className="p-3 border-r border-border">10,000 - 50,000 followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">2.0% - 4.0%</td>
                      <td className="p-3 text-foreground font-semibold">$100 - $400 per post</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Mid-Tier Creator</td>
                      <td className="p-3 border-r border-border">50,000 - 500,000 followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">1.2% - 2.5%</td>
                      <td className="p-3 text-foreground font-semibold">$400 - $1,500 per post</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Macro Page</td>
                      <td className="p-3 border-r border-border">500,000 - 2M+ followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">0.8% - 1.8%</td>
                      <td className="p-3 text-foreground font-semibold">$1,500 - $6,000+ per post</td>
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
                Facebook Engagement FAQs
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Common questions about Facebook organic reach, commenting, viral loops, and sponsorship valuations.
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
