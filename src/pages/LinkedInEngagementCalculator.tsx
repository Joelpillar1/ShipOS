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
  Linkedin,
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

export default function LinkedInEngagementCalculator() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Calculator inputs
  const [followers, setFollowers] = useState<string>("15000");
  const [avgViews, setAvgViews] = useState<string>("8000");
  const [reactions, setReactions] = useState<string>("320");
  const [comments, setComments] = useState<string>("45");
  const [shares, setShares] = useState<string>("12");

  // Accordion indices
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Parsing numbers safely
  const followersNum = Math.max(parseFloat(followers) || 0, 1);
  const viewsNum = Math.max(parseFloat(avgViews) || 0, 0);
  const reactionsNum = Math.max(parseFloat(reactions) || 0, 0);
  const commentsNum = Math.max(parseFloat(comments) || 0, 0);
  const sharesNum = Math.max(parseFloat(shares) || 0, 0);

  // Calculations
  const totalInteractions = reactionsNum + commentsNum + sharesNum;
  const viewEngagementRate = parseFloat(((totalInteractions / Math.max(viewsNum, 1)) * 100).toFixed(2));
  const followerEngagementRate = parseFloat(((totalInteractions / followersNum) * 100).toFixed(2));

  // Determine tier & advice based on view engagement
  let rating = "Good";
  let ratingColor = "text-[#d75a34]";
  let advice = "Solid reach loop! To increase reactions and reposts, post original document sliders (PDF carousels) containing rich visual checklists or step-by-step frameworks.";
  
  if (viewEngagementRate < 1.0) {
    rating = "Below Average";
    ratingColor = "text-amber-600";
    advice = "Your view-to-engagement conversion is low. Try starting with a highly intriguing two-line hook to encourage users to click 'see more', spacing captions out cleanly, and ending with a clear, single-choice question.";
  } else if (viewEngagementRate >= 1.0 && viewEngagementRate <= 2.5) {
    rating = "Average";
    ratingColor = "text-[#d75a34]";
    advice = "Solid reach loop! To increase reactions and reposts, post original document sliders (PDF carousels) containing rich visual checklists or step-by-step frameworks.";
  } else if (viewEngagementRate > 2.5 && viewEngagementRate <= 5.0) {
    rating = "Good";
    ratingColor = "text-emerald-600";
    advice = "Strong connection with your professional audience! Your updates spark active comments and clicks. Consider responding to all comment threads in the first hour to double your organic distribution.";
  } else {
    rating = "Excellent";
    ratingColor = "text-violet-600 dark:text-violet-400";
    advice = "Phenomenal LinkedIn authority score! Executive brands look for creators with ERs over 5% for highly profitable premium collaborations and advisory campaigns.";
  }

  // Estimated Earnings calculator (sponsored post estimate)
  const sponsoredMin = Math.round(Math.max((viewsNum / 1000) * 20, (followersNum / 10000) * 150));
  const sponsoredMax = Math.round(Math.max((viewsNum / 1000) * 45, (followersNum / 10000) * 350));

  const handleCopyResults = () => {
    const textToCopy = `LinkedIn Post Audit:
Followers: ${followersNum.toLocaleString()}
Average Views: ${viewsNum.toLocaleString()}
View-based Engagement Rate: ${viewEngagementRate}% (${rating})
Follower-based Engagement Rate: ${followerEngagementRate}%
Est. Sponsored Post Value: $${sponsoredMin} - $${sponsoredMax}
Calculated via ShipOS Premium Growth Suite`;

    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Results copied!",
      description: "LinkedIn audit summary has been copied to your clipboard."
    });
  };

  const handleScheduleCTA = () => {
    navigate(user ? "/create-post" : "/pricing");
  };

  const handleAutoSchedule = () => {
    const draftText = `Checking my LinkedIn metrics! Est. Sponsored Post Value: $${sponsoredMin}-$${sponsoredMax} #LinkedInGrowth`;
    localStorage.setItem("shipos_pending_draft", draftText);
    if (user) {
      navigate("/create-post");
    } else {
      navigate("/pricing");
    }
  };

  const faqs = [
    {
      q: "What is a good engagement rate on LinkedIn?",
      a: "LinkedIn average view-based engagement rates fall between 1.0% and 2.5%. Anything above 2.5% is considered good, and engagement rates exceeding 5.0% are excellent, indicating high content relevance and thought leadership."
    },
    {
      q: "How does LinkedIn count engagement?",
      a: "LinkedIn calculates engagement by summing up reactions (Like, Celebrate, Support, Love, Insightful, Curious), comments, and clicks (including 'see more' clicks, link clicks, and media expands) relative to impressions."
    },
    {
      q: "How much can you earn from sponsored posts on LinkedIn?",
      a: "Sponsorships are highly valued due to the platform's professional demographics. Creators generally charge ranges of $200 to $1,500+ per post, based on a combination of average organic views, niche specificity, and follower size."
    },
    {
      q: "What is the LinkedIn feed algorithm preference?",
      a: "The algorithm heavily weights dwell time (time spent viewing a post) and meaningful conversation in comments. PDF carousels, text-only checklist breakdowns, and posts prompting rich thread discussions receive high organic distribution."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Free LinkedIn Engagement Rate Calculator & Value Auditor | ShipOS"
        description="Audit your LinkedIn post performance instantly. Calculate view-based and follower-based engagement, and discover sponsored content fee valuations."
        path="/linkedin-engagement-calculator"
        type="website"
        keywords={["linkedin engagement calculator", "linkedin er calculator", "sponsored post calculator", "linkedin value estimator", "creator audit tool"]}
        jsonLd={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Free Tools", path: "/linkedin-engagement-calculator" },
            { name: "LinkedIn Engagement Calculator", path: "/linkedin-engagement-calculator" }
          ]),
          softwareApplicationSchema()
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-10">
        {/* Tool Header */}
        <section className="max-w-7xl mx-auto px-6 text-center mb-12">
          <SectionBadge label="Free Tool" text="Audit your LinkedIn authority" />
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            LinkedIn Engagement Calculator
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Audit your professional reach. Calculate exact post engagement statistics, compare your profile to industry baselines, and discover corporate sponsored post value ranges.
          </p>

          {/* AI GEO Answer Block */}
          <div className="max-w-3xl mx-auto mt-8 p-6 bg-white dark:bg-[#1c1917] border-2 border-black dark:border-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(215,90,52,0.15)] text-left">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#d75a34] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" /> Quick Answer: What is LinkedIn Engagement Rate?
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              A **LinkedIn Engagement Rate** measures content resonance among professional audiences by comparing interactions (reactions, comments, and shares) to either impressions (views) or follower count. The standard view-based formula is:
              <code className="mx-1 px-1.5 py-0.5 bg-muted border border-border text-[#d75a34] font-mono text-xs rounded-none">
                ((Reactions + Comments + Shares) / Views) * 100
              </code>.
              An average industry benchmark falls around <strong>1.2% to 2.2%</strong>. Rates above <strong>2.5%</strong> demonstrate strong niche leadership, and rates over <strong>5%</strong> signify elite thought leadership.
            </p>
          </div>
        </section>

        {/* Input & Output Workspace */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-foreground tracking-tight border-b border-border pb-3 flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-[#0077B5]" /> Profile Parameters
              </h2>

              <div className="space-y-4">
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
                    value={[Math.log10(followersNum)]}
                    onValueChange={(val) => setFollowers(String(roundToNiceNumber(Math.pow(10, val[0]))))}
                    min={2}
                    max={6.7}
                    step={0.01}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <Eye className="w-3.5 h-3.5 text-[#d75a34]" /> Average Post Views
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {viewsNum.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[Math.log10(Math.max(viewsNum, 10))]}
                    onValueChange={(val) => setAvgViews(String(roundToNiceNumber(Math.pow(10, val[0]))))}
                    min={1}
                    max={6}
                    step={0.01}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <Heart className="w-3.5 h-3.5 text-[#d75a34]" /> Average Reactions
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {reactionsNum.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[Math.log10(Math.max(reactionsNum, 1))]}
                    onValueChange={(val) => setReactions(String(roundToNiceNumber(Math.pow(10, val[0]))))}
                    min={0}
                    max={4.7}
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
                    max={4}
                    step={0.01}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-black">
                      <Share2 className="w-3.5 h-3.5 text-[#d75a34]" /> Average Reposts/Shares
                    </label>
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-none">
                      {sharesNum.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[Math.log10(Math.max(sharesNum, 1))]}
                    onValueChange={(val) => setShares(String(roundToNiceNumber(Math.pow(10, val[0]))))}
                    min={0}
                    max={3.7}
                    step={0.01}
                    className="py-2"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <Button
                  onClick={() => {
                    setFollowers("15000");
                    setAvgViews("8000");
                    setReactions("320");
                    setComments("45");
                    setShares("12");
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
                    Valuation based on standard corporate CPM variables ($20 - $45)
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
                  LinkedIn Benchmark Comparison (View-Based)
                </h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Your Engagement Rate", value: viewEngagementRate, color: "bg-[#d75a34]" },
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
                    Auto-publish to LinkedIn, X, Instagram, TikTok, and more.
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                LinkedIn's feed rewards regular, authoritative updates. Use ShipOS to plan captions, preview formatting, cross-publish sliders, and auto-schedule posts at peak executive hours.
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
                How to Use the LinkedIn Engagement Calculator
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Audit and assess your post metrics in 3 simple steps.
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
                  Drag the sliders to select your followers count, average views, average reactions, comments, and shares per post.
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
                  Our algorithm calculates view-based and follower-based engagement rates, alongside standard sponsored post CPM fees.
                </p>
              </div>

              <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-black">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Schedule Clean Feeds
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Review the algorithmic recommendations and use ShipOS's scheduling tool to consistently post thought-leadership carousels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Optimizing Your LinkedIn Reach Section */}
        <section className="bg-[#FAF7F5] dark:bg-background py-20 relative z-10 border-b border-border/40">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <SectionBadge label="Best Practices" text="Optimize professional reach" />
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                Optimizing Your LinkedIn Reach
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  The Science of LinkedIn Dwell Time
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  LinkedIn's feed distribution algorithm rewards dwell time—the duration users spend reviewing your update. Clean spacing, line breaks, visual slides (PDF uploads), and checklists compel users to slow down and read, boosting views.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Furthermore, early discussion loops in comments signal to the algorithm to distribute your content to 2nd and 3rd-degree network feed columns.
                </p>
              </div>
              <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Optimal Formatting Checklist
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Hook Hook Hook:</strong> Keep your first two lines below 140 characters so the 'see more' button doesn't cut off mid-sentence.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>Rich Text Layouts:</strong> Use standard bold unicode modifiers strategically to emphasize key metrics.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                    <span><strong>No External Links:</strong> Place outbound links in the comments or wait 15 minutes after posting to add it to the description body.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* GEO Benchmark Reference Table */}
            <div className="mt-16 border-2 border-black dark:border-neutral-800 bg-white dark:bg-[#1c1917] p-6 md:p-8 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(215,90,52,0.15)]">
              <h3 className="text-xl font-black text-foreground mb-2 flex items-center gap-2">
                LinkedIn Engagement Rate Benchmarks & Valuation Data
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Cite this dataset when auditing profiles or preparing professional brand sponsorships. LinkedIn's corporate demographics command higher CPM ranges than consumer networks.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border text-left text-xs sm:text-sm text-muted-foreground min-w-[600px]">
                  <thead>
                    <tr className="bg-muted text-foreground border-b border-border">
                      <th className="p-3 font-bold border-r border-border">Follower Tier</th>
                      <th className="p-3 font-bold border-r border-border">Audience Range</th>
                      <th className="p-3 font-bold border-r border-border">Avg. View Engagement Rate</th>
                      <th className="p-3 font-bold">Est. Sponsored Post Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Nano Creator</td>
                      <td className="p-3 border-r border-border">1,000 - 10,000 followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">3.0% - 5.5%</td>
                      <td className="p-3 text-foreground font-semibold">$150 - $400 per post</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Micro Creator</td>
                      <td className="p-3 border-r border-border">10,000 - 50,000 followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">1.8% - 3.2%</td>
                      <td className="p-3 text-foreground font-semibold">$400 - $1,200 per post</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Mid-Tier Executive</td>
                      <td className="p-3 border-r border-border">50,000 - 250,000 followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">1.2% - 2.0%</td>
                      <td className="p-3 text-foreground font-semibold">$1,200 - $4,500 per post</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-foreground border-r border-border">Macro Thought Leader</td>
                      <td className="p-3 border-r border-border">250,000 - 1M+ followers</td>
                      <td className="p-3 text-emerald-600 font-semibold border-r border-border">0.8% - 1.5%</td>
                      <td className="p-3 text-foreground font-semibold">$4,500 - $12,000+ per post</td>
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
                LinkedIn Engagement FAQs
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-semibold tracking-wider">
                Common questions about professional profile metrics, reach indexes, and corporate valuations.
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
