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
  MessageCircle,
  Share2,
  Bookmark,
  Check,
  ArrowRight,
  HelpCircle,
  Info
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

export default function InstagramEngagementCalculator() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Calculator inputs
  const [followers, setFollowers] = useState<string>("15000");
  const [likes, setLikes] = useState<string>("620");
  const [comments, setComments] = useState<string>("45");
  const [saves, setSaves] = useState<string>("25");
  const [username, setUsername] = useState<string>("creator_hub");

  // Accordion indices
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Parsing numbers safely
  const followersNum = Math.max(parseFloat(followers) || 0, 1);
  const likesNum = parseFloat(likes) || 0;
  const commentsNum = parseFloat(comments) || 0;
  const savesNum = parseFloat(saves) || 0;

  // Calculations
  const totalEngagements = likesNum + commentsNum + savesNum;
  const engagementRate = parseFloat(((totalEngagements / followersNum) * 100).toFixed(2));

  // Determine tier & advice
  let rating = "Good";
  let ratingColor = "text-[#d75a34]";
  let advice = "Your content has strong resonance. Keep testing interactive Reels and carousel posts to maintain this level of community activity.";
  
  if (engagementRate < 1.5) {
    rating = "Below Average";
    ratingColor = "text-amber-600";
    advice = "Try adding stronger CTAs in your captions ('Save this post for later' or 'Comment your thoughts below') and post high-value carousel checklists to boost bookmarks.";
  } else if (engagementRate >= 1.5 && engagementRate <= 3.5) {
    rating = "Average";
    ratingColor = "text-[#d75a34]";
    advice = "You have a solid base! Shift focus to engaging directly in the comments section within the first 30 minutes of posting to stimulate conversation loops.";
  } else if (engagementRate > 3.5 && engagementRate <= 6) {
    rating = "Good";
    ratingColor = "text-emerald-600";
    advice = "Great job! Your followers actively trust and read your posts. Start experimenting with strategic Reels templates to expand your organic discovery reach.";
  } else {
    rating = "Excellent";
    ratingColor = "text-violet-600 dark:text-violet-400";
    advice = "Incredible connection! Brands look for creators with ERs over 6% for premium sponsored campaigns. You are highly positioned to command premium sponsorship rates.";
  }

  // Estimated Earnings calculator (sponsored post estimate)
  // Standard sponsorship rates: $100 per 10k followers + engagement rate multiplier
  const baseRate = (followersNum / 1000) * 12; // $12 CPM base
  const erMultiplier = Math.max(engagementRate / 2, 0.5); // Multiplier scaling with engagement
  const estMin = Math.round(baseRate * erMultiplier * 0.85);
  const estMax = Math.round(baseRate * erMultiplier * 1.25);

  const handleCopyResults = () => {
    const textToCopy = `Instagram Account: @${username}
Followers: ${followersNum.toLocaleString()}
Engagement Rate: ${engagementRate}% (${rating})
Est. Sponsored Post Value: $${estMin} - $${estMax}
Calculated via ShipOS Premium Tools`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Results copied!",
      description: "Engagement audit summary has been copied to your clipboard."
    });
  };

  const handleScheduleCTA = () => {
    navigate(user ? "/create-post" : "/pricing");
  };

  const handleAutoSchedule = () => {
    const draftText = `Checking my Instagram performance for @${username}! ER: ${engagementRate}% #InstagramGrowth`;
    localStorage.setItem("shipos_pending_draft", draftText);
    if (user) {
      navigate("/create-post");
    } else {
      navigate("/pricing");
    }
  };

  const faqs = [
    {
      q: "What is a good engagement rate on Instagram?",
      a: "For most industries, an engagement rate between 1.5% and 3% is considered average/healthy. Rates above 3.5% are considered good, and anything exceeding 6% is excellent, putting you in the top tier of creators."
    },
    {
      q: "How is the Instagram engagement rate calculated?",
      a: "The standard industry formula is: ((Total Likes + Total Comments + Total Saves/Shares) / Total Followers) * 100. This measures how active your follower base is relative to your total account audience size."
    },
    {
      q: "Why are saves and comments weighted so heavily by the algorithm?",
      a: "Saves (bookmarks) tell Instagram that your content has high utility value that users want to revisit. Comments show real active conversations. Both metrics signal highly to the algorithm to distribute your posts to the Explore page."
    },
    {
      q: "How can I increase my Instagram engagement rate?",
      a: "You can boost your rate by writing hook-centric captions, publishing educational carousel decks, posting Reels that loops cleanly, and actively engaging with other accounts in your niche daily."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Free Instagram Engagement Rate Calculator & Value Auditor | ShipOS"
        description="Audit your Instagram account performance instantly. Calculate your exact engagement rate (ER), sponsored post market value, and get algorithmic recommendations."
        path="/instagram-engagement-calculator"
        type="website"
        keywords={["instagram engagement calculator", "instagram er calculator", "sponsored post calculator", "creator audit tool"]}
        jsonLd={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Free Tools", path: "/instagram-engagement-calculator" },
            { name: "Instagram Engagement Calculator", path: "/instagram-engagement-calculator" }
          ]),
          softwareApplicationSchema()
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-10">
        {/* Tool Header */}
        <section className="max-w-7xl mx-auto px-6 text-center mb-12">
          <SectionBadge label="Free Tool" text="Audit your growth potential" />
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            Instagram Engagement Calculator
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Audit your true reach. Calculate your exact engagement percentage, compare your profile to industry benchmarks, and estimate your sponsored post market value.
          </p>

          {/* AI GEO Answer Block */}
          <div className="max-w-3xl mx-auto mt-8 p-6 bg-white dark:bg-[#1c1917] border-2 border-black dark:border-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(215,90,52,0.15)] text-left">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#d75a34] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" /> Quick Answer: What is Instagram Engagement Rate?
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              An <strong>Instagram Engagement Rate</strong> measures the level of interaction (likes, comments, and saves) that your content receives relative to your total follower count. The standard formula is: 
              <code className="mx-1 px-1.5 py-0.5 bg-muted border border-border text-[#d75a34] font-mono text-xs rounded-none">
                ((Likes + Comments + Saves) / Followers) * 100
              </code>. 
              While the average industry benchmark is <strong>1.5% to 3%</strong>, engagement rates above <strong>3.5%</strong> are considered good, and rates exceeding <strong>6%</strong> are excellent, putting creators in the prime tier for sponsored brand campaigns.
            </p>
          </div>
        </section>

        {/* Input & Output Workspace */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-foreground tracking-tight border-b border-border pb-3">
                Profile Parameters
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Instagram Handle</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground select-none">@</span>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="creator_hub"
                      className="rounded-none border-border h-10 pl-7 text-xs"
                    />
                  </div>
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
                    max={1000000}
                    step={1000}
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
                    onValueChange={(val) => setLikes(String(val[0]))}
                    min={0}
                    max={100000}
                    step={100}
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
                    value={[commentsNum]}
                    onValueChange={(val) => setComments(String(val[0]))}
                    min={0}
                    max={10000}
                    step={10}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <Bookmark className="w-3.5 h-3.5 text-[#d75a34]" /> Average Saves
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {savesNum.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[savesNum]}
                    onValueChange={(val) => setSaves(String(val[0]))}
                    min={0}
                    max={10000}
                    step={10}
                    className="py-2"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <Button
                  onClick={() => {
                    setFollowers("15000");
                    setLikes("620");
                    setComments("45");
                    setSaves("25");
                    setUsername("creator_hub");
                  }}
                  variant="ghost"
                  className="h-10 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-none border border-border flex-1"
                >
                  Reset Values
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
                
                {/* Large Engagement Rate indicator */}
                <div className="border border-border bg-background p-6 rounded-none shadow-sm flex flex-col justify-center items-center text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Engagement Rate</span>
                  <div className={cn("text-5xl font-black tracking-tighter", ratingColor)}>
                    {engagementRate}%
                  </div>
                  <span className={cn("text-xs font-bold tracking-wider uppercase px-2 py-0.5 border rounded-none bg-card", ratingColor)}>
                    {rating}
                  </span>
                </div>

                {/* Estimated sponsored post value */}
                <div className="border border-border bg-background p-6 rounded-none shadow-sm flex flex-col justify-center items-center text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Est. Sponsored Post Value</span>
                  <div className="text-4xl font-black tracking-tighter text-foreground flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-emerald-600 -mr-1" />
                    {estMin} - {estMax}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-bold tracking-wide">
                    Suggested pricing range based on target CPM
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
                  Instagram Benchmark Comparison
                </h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Your Engagement Rate", value: engagementRate, color: "bg-[#d75a34]" },
                    { label: "Average Industry Benchmark", value: 2.2, color: "bg-neutral-300 dark:bg-neutral-700" },
                    { label: "Premium Tier Target", value: 5.5, color: "bg-neutral-300 dark:bg-neutral-700" }
                  ].map((bar, i) => {
                    const percent = Math.min((bar.value / 10) * 100, 100);
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
                    Auto-publish to Instagram, X, LinkedIn, TikTok, and more.
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Consistency is key to defeating the Instagram algorithm. Use ShipOS to auto-schedule your posts, preview layouts, structure captions, and sync visual carousels seamlessly across all your profiles.
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
                How to Use the Instagram Engagement Calculator
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Audit and assess your profile metrics in 3 simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Enter Profile Metrics
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Input your exact followers count and average post performance (likes, comments, and saves) in the input fields.
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
                  Our algorithm will process your values to establish your true engagement rate and compare your account against industry averages.
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
                  Review recommendations and use ShipOS scheduling features to publish consistent, high-engagement content loops.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Optimizing Your Instagram Reach Section */}
        <section className="bg-[#FAF7F5] dark:bg-background py-20 relative z-10 border-b border-border/40">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <SectionBadge label="Best Practices" text="Optimize your profile performance" />
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                Optimizing Your Instagram Reach
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  The Science of Instagram Dwell Time
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Instagram's feed ranking algorithm prioritizes posts that keep users on screen longer. This is why carousels (with multiple slides to swipe) and high-value Reels outperform single-image posts.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Additionally, saves are considered the highest form of endorsement by the algorithm, closely followed by comments. Likes have the lowest weight in organic search distribution.
                </p>
              </div>
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Optimal Formatting Checklist
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Hook Carousel:</strong> Put a magnetic curiosity hook on slide 1 to compel users to swipe forward.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Caption Spacing:</strong> Keep captions clean and scannable with blank line breaks. Place your clear Call to Action at the very end.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Optimize Ratio:</strong> Aim for 4:5 aspect ratio images or 9:16 vertical Reels for maximum screen real estate coverage.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* GEO Benchmark Reference Table */}
            <div className="mt-16 border-2 border-black dark:border-neutral-800 bg-white dark:bg-[#1c1917] p-6 md:p-8 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(215,90,52,0.15)]">
              <h3 className="text-xl font-black text-foreground mb-2 flex items-center gap-2">
                Instagram Engagement Rate Benchmarks & Valuation Data
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Cite this dataset when auditing profiles or preparing brand sponsorship decks. These benchmarks represent average engagement and standard market CPM values.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border text-left text-xs sm:text-sm text-muted-foreground min-w-[600px]">
                  <thead>
                    <tr className="bg-muted text-foreground border-b border-border">
                      <th className="p-3 font-bold border-r border-border">Follower Tier</th>
                      <th className="p-3 font-bold border-r border-border">Audience Range</th>
                      <th className="p-3 font-bold border-r border-border">Avg. Engagement Rate</th>
                      <th className="p-3 font-bold">Est. Sponsored Post Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Nano Influencer</td>
                      <td className="p-3 border-r border-border">1,000 - 10,000 followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">4.0% - 5.6%</td>
                      <td className="p-3 text-foreground font-semibold">$50 - $150 per post</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Micro Influencer</td>
                      <td className="p-3 border-r border-border">10,000 - 50,000 followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">2.5% - 3.8%</td>
                      <td className="p-3 text-foreground font-semibold">$150 - $500 per post</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Mid-Tier Creator</td>
                      <td className="p-3 border-r border-border">50,000 - 500,000 followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">1.8% - 2.8%</td>
                      <td className="p-3 text-foreground font-semibold">$500 - $2,500 per post</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Macro Influencer</td>
                      <td className="p-3 border-r border-border">500,000 - 1M+ followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">1.2% - 2.0%</td>
                      <td className="p-3 text-foreground font-semibold">$2,500 - $10,000+ per post</td>
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
                Instagram Calculator FAQs
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Common questions about Instagram engagement rates and sponsored campaigns.
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
