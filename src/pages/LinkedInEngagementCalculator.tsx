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
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";
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

      <main className="pt-28 pb-10">
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

        {/* Grow with ShipOS Pricing Section */}
        <section className="bg-[#FAF7F5] dark:bg-background border-t border-b border-border/40 py-20 relative z-10">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-14">
              <SectionBadge label="Grow" text="Supercharge your social presence" />
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                Grow with ShipOS
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
                Stop composing, start publishing. ShipOS auto-schedules your professional updates across LinkedIn, X, Instagram, TikTok, Threads, and Bluesky — all from one workspace.
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
