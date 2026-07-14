import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Images,
  Layers,
  ListTodo,
  Sparkles,
  Terminal,
  TrendingUp,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FounderStory } from "@/components/FounderStory";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingPricingBillingToggle } from "@/components/MarketingPricingCards";
import { ContentStudioMockup } from "@/components/ContentStudioMockup";
import { BulkScheduleMockup } from "@/components/BulkScheduleMockup";
import { SlideshowStudioMockup } from "@/components/SlideshowStudioMockup";
import { AnalyticsDashboardMockup } from "@/components/AnalyticsDashboardMockup";
import { DashboardAppPreview } from "@/components/DashboardAppPreview";
import { DashboardCalendarPreview } from "@/components/DashboardCalendarPreview";
import { CreatePostMockup } from "@/components/CreatePostMockup";
import {
  BlueskyIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  PinterestIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/PlatformIcons";
import { cn } from "@/lib/utils";
import { PLAN_BY_NAME } from "@/lib/plans";
import { pricingCardHover } from "@/lib/marketingButtons";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  changePlan,
  setSignupPlanIntent,
  startCheckout,
  signupUrlForPlanIntent,
  type BillingCycle,
  type SignupPlanIntent,
} from "@/lib/billing";
import { getUserProfile, setUserPlan } from "@/lib/postStorage";
import {
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  softwareApplicationSchema,
} from "@/lib/seo";

const FadeIn = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const SectionBadge = ({
  label,
  text,
  mobileText,
}: {
  label: string;
  text: string;
  mobileText?: string;
}) => (
  <div className="inline-flex items-center gap-2 border border-[#d75a34]/60 rounded-full p-1 pr-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm shadow-sm max-w-full">
    <div className="bg-gradient-to-b from-[#e36e4b] to-[#d75a34] text-white text-[13px] font-bold px-3 py-1 rounded-full shadow-inner shrink-0 whitespace-nowrap">
      {label}
    </div>
    <span className="text-[13px] font-semibold text-gray-800 dark:text-neutral-200 tracking-wide whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
      <span className={mobileText ? "hidden sm:inline" : "inline"}>{text}</span>
      {mobileText && <span className="inline sm:hidden">{mobileText}</span>}
    </span>
  </div>
);

const proPlan = PLAN_BY_NAME.Pro;

const scrollToPricing = () => {
  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const faqs = [
  {
    question: "Do I need a payment method for the 7-day trial?",
    answer:
      "Yes. A payment method is required at signup, but you will not be charged until the trial ends. Cancel anytime during the trial and you will not be billed.",
  },
  {
    question: "What do I get on Pro?",
    answer:
      "Pro includes unlimited workspaces, unlimited connected accounts, unlimited posts, Slideshow Studio (10 slides), unlimited Content Studio access, bulk scheduling up to 50 posts at once, full analytics, and priority human support.",
  },
  {
    question: "How does Lifetime Pro work?",
    answer:
      "Lifetime Pro is a one-time $299 payment for full Pro access forever, including future updates. It is limited to the first 50 buyers and includes a 7-day refund guarantee.",
  },
  {
    question: "How is this different from Buffer or Hootsuite?",
    answer:
      "Those tools are built for teams and agencies with per-channel pricing and heavy dashboards. ShipOS is a flat-rate ops layer for founders who need to publish, schedule, and ship — without managing an enterprise suite.",
  },
  {
    question: "Can I automate posting from Cursor or Claude?",
    answer:
      "Yes. ShipOS includes MCP tools so you can connect accounts, create posts, schedule bulk posts, and pull results from an AI coding agent when you prefer to work that way.",
  },
];

const platforms = [
  { name: "X", Icon: XIcon, color: "text-foreground" },
  { name: "Instagram", Icon: InstagramIcon, color: "text-[#E4405F]" },
  { name: "LinkedIn", Icon: LinkedInIcon, color: "text-[#0A66C2]" },
  { name: "Facebook", Icon: FacebookIcon, color: "text-[#1877F2]" },
  { name: "TikTok", Icon: TikTokIcon, color: "text-foreground" },
  { name: "YouTube", Icon: YouTubeIcon, color: "text-[#FF0000]" },
  { name: "Bluesky", Icon: BlueskyIcon, color: "text-[#0085FF]" },
  { name: "Threads", logo: "/images/threads-logo.png", color: "text-foreground" },
  { name: "Pinterest", Icon: PinterestIcon, color: "text-[#E60023]" },
] as const;

const weekSteps = [
  {
    day: "Fri",
    title: "Batch",
    detail: "Draft the week in Content Studio. Park unfinished work in Drafts.",
  },
  {
    day: "Sat",
    title: "Schedule",
    detail: "Drop posts on the calendar or bulk-import a CSV. Confirm once.",
  },
  {
    day: "Launch",
    title: "Ship",
    detail: "Post Now for the launch. Retry failed posts without rewriting.",
  },
  {
    day: "Mon",
    title: "Review",
    detail: "Open Analytics. Keep what worked. Kill what didn’t. Repeat.",
  },
];

const features = [
  {
    badge: "Publishing",
    badgeIcon: <Layers className="w-3.5 h-3.5" />,
    title: (
      <>
        One composer.{" "}
        <span className="text-[#d75a34] italic font-semibold">Every network.</span>
      </>
    ),
    desc: "Write once, tune per platform, post now or schedule. Multiple accounts per network on Pro — personal LinkedIn plus company page, two X accounts, whatever you actually run.",
    bullets: [
      "Multiple accounts per network",
      "Post now or schedule",
      "LinkedIn + X + more in one composer",
      "Platform-aware length",
    ],
    mockup: <CreatePostMockup />,
    mockupScale: "scale-[0.85] sm:scale-95 md:scale-100",
  },
  {
    badge: "Bulk Scheduling",
    badgeIcon: <ListTodo className="w-3.5 h-3.5" />,
    title: (
      <>
        Upload a week of posts{" "}
        <span className="text-[#d75a34] italic font-semibold">in one sitting</span>
      </>
    ),
    desc: "Import CSV, TSV, or plain text. Pro queues up to 50 posts at once. Fill the calendar, confirm, get back to the product.",
    bullets: [
      "CSV / TSV / paste import",
      "Up to 50 posts per batch",
      "Auto-space or file dates",
      "Confirm once, fill the week",
    ],
    mockup: <BulkScheduleMockup />,
    mockupScale: "scale-[0.85] sm:scale-95 md:scale-100",
  },
  {
    badge: "Content Studio",
    badgeIcon: <Sparkles className="w-3.5 h-3.5" />,
    title: (
      <>
        Draft faster when you{" "}
        <span className="text-[#d75a34] italic font-semibold">already know the point</span>
      </>
    ),
    desc: "Hooks, rewrites, CTAs, thread starters. You stay editor-in-chief — nothing publishes until you say so. Pro includes unlimited Studio access.",
    bullets: [
      "Hooks, rewrites, CTAs",
      "You approve before anything publishes",
      "Unlimited Studio on Pro",
      "Stay editor-in-chief",
    ],
    mockup: <ContentStudioMockup />,
    mockupScale: "scale-[0.85] sm:scale-95 md:scale-100",
  },
  {
    badge: "Visual Calendar",
    badgeIcon: <CalendarDays className="w-3.5 h-3.5" />,
    title: (
      <>
        See the month.{" "}
        <span className="text-[#d75a34] italic font-semibold">Move one tile.</span>
      </>
    ),
    desc: "Drag to reschedule. Spot empty days. Keep drafts, scheduled, posted, and failed in clear queues so launch week doesn’t turn into guesswork.",
    bullets: [
      "Drag to reschedule",
      "Draft / scheduled / posted / failed queues",
      "Spot empty days",
      "Month at a glance",
    ],
    mockup: (
      <div className="w-full max-w-[640px] bg-card border border-border shadow-sm overflow-hidden rounded-none p-3">
        <DashboardCalendarPreview compact onActionClick={scrollToPricing} />
      </div>
    ),
    mockupScale: "scale-[0.85] sm:scale-95 md:scale-100",
  },
  {
    badge: "Slideshow Studio",
    badgeIcon: <Images className="w-3.5 h-3.5" />,
    title: (
      <>
        Carousels without{" "}
        <span className="text-[#d75a34] italic font-semibold">opening Canva</span>
      </>
    ),
    desc: "Build LinkedIn and Instagram slideshows inside ShipOS — fonts, backgrounds, text casing — then schedule them. Pro supports up to 10 slides.",
    bullets: [
      "LinkedIn & Instagram carousels",
      "Up to 10 slides on Pro",
      "Fonts, backgrounds, casing",
      "Schedule without Canva",
    ],
    mockup: <SlideshowStudioMockup />,
    mockupScale: "scale-[0.85] sm:scale-95 md:scale-100",
  },
  {
    badge: "Analytics",
    badgeIcon: <TrendingUp className="w-3.5 h-3.5" />,
    title: (
      <>
        One dashboard for{" "}
        <span className="text-[#d75a34] italic font-semibold">what actually moved</span>
      </>
    ),
    desc: "Likes, comments, views, reach across connected accounts. Stop logging into five apps to learn which update drove signups.",
    bullets: [
      "Views, reach, engagement in one place",
      "Per-network breakdown",
      "Top post spotlight",
      "7D / 30D / 90D ranges",
    ],
    mockup: <AnalyticsDashboardMockup />,
    mockupScale: "scale-[0.85] sm:scale-95 md:scale-100",
  },
];

export default function Founder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isMockMode } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isAnnual, setIsAnnual] = useState(false);
  const [busyPro, setBusyPro] = useState(false);
  const [busyLifetime, setBusyLifetime] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user || isMockMode) {
      getUserProfile().then(setProfile);
    }
  }, [user, isMockMode]);

  const ensureCanCheckout = (intent: SignupPlanIntent) => {
    if (!isMockMode && !user) {
      setSignupPlanIntent(intent);
      navigate(signupUrlForPlanIntent(intent));
      return false;
    }
    if (profile && profile.plan !== "Free") {
      toast({
        title: "Existing Subscription",
        description: "Redirecting you to Settings to change your plan securely.",
      });
      navigate("/settings?tab=plans", { state: { activeSection: "plans" } });
      return false;
    }
    return true;
  };

  async function handleProSelect() {
    const cycle: BillingCycle = isAnnual ? "annual" : "monthly";
    if (!ensureCanCheckout({ plan: "Pro", cycle })) return;
    setBusyPro(true);
    try {
      const res = await changePlan("Pro", cycle);
      if (res.mockGranted) {
        toast({
          title: "Plan updated",
          description: "You're now on the Pro plan (demo mode).",
        });
        setProfile(await getUserProfile());
      } else if (res.changed) {
        toast({
          title: "Plan change started",
          description: "Switching you to Pro. This updates in a few seconds.",
        });
      } else if (res.alreadySubscribed) {
        toast({
          title: "You already have an active subscription",
          description: "Manage or change your plan from Settings → Billing.",
        });
      }
    } catch (e: any) {
      toast({
        title: "Checkout error",
        description: e?.message || "Could not start Pro checkout.",
        variant: "destructive",
      });
    } finally {
      setBusyPro(false);
    }
  }

  async function handleLifetimeSelect() {
    if (!ensureCanCheckout({ plan: "Pro", cycle: "lifetime" })) return;
    setBusyLifetime(true);
    try {
      if (!supabase) {
        await setUserPlan("Pro");
        toast({
          title: "Lifetime Access Activated!",
          description: "You now have lifetime Pro plan access (demo mode).",
        });
        setProfile(await getUserProfile());
      } else {
        const res = await startCheckout("Pro", "lifetime");
        if (res.mockGranted) {
          toast({
            title: "Lifetime Access Activated!",
            description: "You now have lifetime Pro plan access (demo mode).",
          });
          setProfile(await getUserProfile());
        }
      }
    } catch (e: any) {
      toast({
        title: "Offer Activation Error",
        description: e?.message || "Could not process your request.",
        variant: "destructive",
      });
    } finally {
      setBusyLifetime(false);
    }
  }

  const proPrice = isAnnual ? proPlan.price.annual : proPlan.price.monthly;
  const proPriceLabel = isAnnual ? "/yr" : "/mo";

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background text-foreground overflow-x-hidden relative">
      {/* Blueprint frame — thin vertical + horizontal rules (full viewport) */}
      <div className="pointer-events-none fixed inset-0 z-40" aria-hidden="true">
        {/* Verticals */}
        <div className="absolute inset-y-0 left-[max(1.25rem,calc(50%-40rem))] w-px bg-border/70 dark:bg-border/50" />
        <div className="absolute inset-y-0 right-[max(1.25rem,calc(50%-40rem))] w-px bg-border/70 dark:bg-border/50" />
        {/* Horizontals */}
        <div className="absolute left-0 right-0 top-[calc(5rem+var(--banner-h,0px))] h-px bg-border/70 dark:bg-border/50" />
      </div>

      <SEO
        title="ShipOS for Founders — Social Ops Without Losing Build Time"
        description="ShipOS is the social publishing layer for founders: compose, schedule, bulk upload, slideshows, analytics, workspaces, and MCP automation across nine networks. Start Pro with a 7-day trial, or lock Lifetime Pro for $299."
        path="/founder"
        type="website"
        keywords={[
          "social media tool for founders",
          "saas founder social media scheduler",
          "build in public tool",
          "founder social media management",
          "shipos for founders",
          "lifetime social media scheduler",
        ]}
        jsonLd={[
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "For Founders", path: "/founder" },
          ]),
          faqSchema(faqs),
          howToSchema({
            name: "How founders run social with ShipOS",
            description:
              "Connect accounts, batch content, schedule the week, publish launches, and review analytics.",
            path: "/founder",
            steps: [
              {
                name: "Connect your networks",
                text: "Link LinkedIn, X, Instagram, and the other platforms you actually post to.",
              },
              {
                name: "Batch and schedule",
                text: "Draft in Content Studio or bulk import, then place posts on the calendar.",
              },
              {
                name: "Ship and review",
                text: "Publish on launch day, recover failed posts, and read analytics the next week.",
              },
            ],
          }),
        ]}
      />
      <Header />

      {/* ── Hero (Dock / MakerThrive style: brand + one line + CTA + product visual) ── */}
      <section className="relative pt-52 sm:pt-56 pb-10 px-6 lg:px-12">
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <FadeIn>
            <SectionBadge
              label="Founders"
              text="Social ops without losing build time"
              mobileText="Social ops that ship"
            />
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black tracking-tight leading-[1.05] text-foreground">
              Ship the product.
              <br />
              <span className="text-[#d75a34] italic font-semibold">Run social in one batch.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The calendar and queue for founders who won’t let manual social posting/scheduling eat
              the roadmap.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Button
                onClick={handleProSelect}
                disabled={busyPro}
                variant="marketing"
                className="h-12 px-8 text-base font-medium"
              >
                {busyPro ? "Processing..." : (
                  <>
                    Get Started — 7-day free trial <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </FadeIn>
        </div>

        {/* Hero — full dashboard shell: sidebar + calendar */}
        <FadeIn delay={0.28} className="relative max-w-7xl mx-auto mt-12 sm:mt-14 px-0">
          <div className="relative w-full overflow-hidden rounded-none shadow-none transition-shadow duration-200 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <DashboardAppPreview onCalendarAction={scrollToPricing} />
          </div>
        </FadeIn>
      </section>

      {/* ── Problem → promise (connected cards) ── */}
      <section className="relative py-20 sm:py-24 px-6 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.2]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden
        />
        <FadeIn className="relative max-w-xl mx-auto">
          <div className="flex flex-col items-center">
            {/* Top card — pattern */}
            <div className="w-full rounded-none border border-border/80 bg-white dark:bg-[#1f1d1b] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 sm:p-8 text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-foreground">
                You know the pattern.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Monday you meant to post the launch. Tuesday you fixed production. Friday the post
                still lives in Notes. Agency tools make it worse — seats, approvals, per-profile
                pricing.
              </p>
            </div>

            {/* Connector */}
            <div className="relative flex flex-col items-center w-full py-1">
              <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-border" />
              <div className="relative z-10 my-3 inline-flex items-center gap-1.5 rounded-none border border-border bg-white dark:bg-[#1f1d1b] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shadow-sm">
                Batch
                <span className="text-foreground/50" aria-hidden>
                  ↓
                </span>
                Schedule
              </div>
            </div>

            {/* Bottom card — promise */}
            <div className="w-full rounded-none border border-border/80 bg-white dark:bg-[#1f1d1b] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 sm:p-8 text-center space-y-3">
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-none border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Ready
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
                ShipOS assumes you{" "}
                <span className="text-[#d75a34] italic">are</span> the department. Batch once.
                Schedule the week. Get back to the product.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Features (landing rows, not blog) ── */}
      <section id="features" className="pb-8 px-6 scroll-mt-24">
        <FadeIn className="max-w-3xl mx-auto text-center mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Everything you need to{" "}
            <span className="text-[#d75a34] italic font-semibold">ship distribution</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Full Pro capabilities. No mid-trial feature gates on the core workflow.
          </p>
        </FadeIn>

        <div className="max-w-6xl mx-auto space-y-10">
          {features.map((feature, idx) => {
            const isEven = idx % 2 === 1;
            const visual = feature.mockup ? (
              <div
                className={cn(
                  "w-full border-b lg:border-b-0 lg:border-r border-[#f0dfd8] dark:border-neutral-800/80 flex items-center justify-center relative overflow-hidden",
                  feature.badge === "Slideshow Studio"
                    ? "lg:w-[58%] p-6 lg:p-7"
                    : "lg:w-[55%] p-6 lg:p-10",
                  feature.badge === "Publishing" ||
                  feature.badge === "Bulk Scheduling" ||
                  feature.badge === "Content Studio" ||
                  feature.badge === "Visual Calendar"
                    ? "min-h-[320px] sm:min-h-[400px] lg:min-h-[520px]"
                    : feature.badge === "Slideshow Studio"
                    ? "min-h-[320px] sm:min-h-[400px] lg:min-h-[460px]"
                    : feature.badge === "Analytics"
                    ? "min-h-[340px] sm:min-h-[400px] lg:min-h-[520px] max-h-[380px] sm:max-h-none"
                    : "bg-[#fcf5f3] dark:bg-[#191715] aspect-square lg:aspect-auto lg:min-h-[380px]"
                )}
              >
                {(feature.badge === "Publishing" ||
                  feature.badge === "Bulk Scheduling" ||
                  feature.badge === "Content Studio" ||
                  feature.badge === "Visual Calendar" ||
                  feature.badge === "Slideshow Studio" ||
                  feature.badge === "Analytics") && (
                  <img
                    src="/images/composer/mesh-bg.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    aria-hidden
                  />
                )}
                <div
                  className={cn(
                    "relative z-10 transition-transform duration-500 origin-center max-w-full",
                    (feature.badge === "Slideshow Studio" || feature.badge === "Analytics") &&
                      "w-full max-w-none",
                    feature.badge === "Analytics" && "max-h-[320px] sm:max-h-[380px] md:max-h-none overflow-hidden",
                    feature.mockupScale
                  )}
                >
                  {feature.mockup}
                </div>
              </div>
            ) : (
              <div className="w-full lg:w-[45%] bg-[#fcf5f3] dark:bg-[#191715] border-b lg:border-b-0 lg:border-r border-[#f0dfd8] dark:border-neutral-800/80 flex items-center justify-center p-10 min-h-[240px]">
                <div className="border-2 border-black bg-white dark:bg-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 max-w-xs text-left space-y-3">
                  <p className="text-xs font-black uppercase tracking-wider text-[#d75a34]">
                    Composer
                  </p>
                  <p className="text-sm font-bold text-foreground leading-snug">
                    Write once. Tune for LinkedIn length, X limits, Instagram captions. Post now or
                    pick a slot.
                  </p>
                </div>
              </div>
            );

            const copy = (
              <div className="w-full lg:flex-1 p-8 lg:p-12 flex flex-col justify-center text-left space-y-4">
                <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#d75a34]">
                  {feature.badgeIcon}
                  {feature.badge}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
                <ul className="space-y-2.5 pt-1">
                  {feature.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-sm font-semibold text-foreground/90"
                    >
                      <Check className="w-4 h-4 text-[#d75a34] stroke-[3] mt-0.5 shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            );

            return (
              <FadeIn key={feature.badge} delay={0.05}>
                <div className="bg-white dark:bg-[#1f1d1b] border border-[#f0dfd8] dark:border-neutral-800/80 rounded-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col lg:flex-row w-full">
                  {!isEven ? (
                    <>
                      {visual}
                      {copy}
                    </>
                  ) : (
                    <>
                      {copy}
                      {visual}
                    </>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>

        <div className="max-w-6xl mx-auto mt-10 grid sm:grid-cols-2 gap-4">
          <FadeIn>
            <div className="border-2 border-black bg-white dark:bg-[#1f1d1b] p-7 space-y-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] h-full">
              <div className="flex items-center gap-2 text-[#d75a34]">
                <Layers className="w-4 h-4" />
                <h3 className="text-sm font-black uppercase tracking-wider">Workspaces</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Separate products or side projects without mixing queues.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Own connections per workspace",
                  "Separate drafts, queues & calendar",
                  "Switch products without clutter",
                  "Unlimited workspaces on Pro",
                ].map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2 text-sm font-semibold text-foreground/90"
                  >
                    <Check className="w-4 h-4 text-[#d75a34] stroke-[3] mt-0.5 shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <div className="border-2 border-black bg-white dark:bg-[#1f1d1b] p-7 space-y-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] h-full">
              <div className="flex items-center gap-2 text-[#d75a34]">
                <Terminal className="w-4 h-4" />
                <h3 className="text-sm font-black uppercase tracking-wider">MCP for builders</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Run ShipOS from Cursor or Claude when you already live in the editor.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Connect accounts from the editor",
                  "Create or schedule posts via MCP",
                  "Bulk schedule without leaving chat",
                  "Pull results back into your workflow",
                ].map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2 text-sm font-semibold text-foreground/90"
                  >
                    <Check className="w-4 h-4 text-[#d75a34] stroke-[3] mt-0.5 shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Platforms ── */}
      <section className="py-20 px-6">
        <FadeIn className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Nine networks.{" "}
            <span className="text-[#d75a34] italic font-semibold">One queue.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Most founders live on LinkedIn and X. ShipOS still covers the rest so you’re not
            juggling a second tool when Instagram or YouTube matter for a launch.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 max-w-3xl mx-auto">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="flex flex-col items-center justify-center gap-2.5 w-[calc((100%-1.25rem)/3)] sm:w-[calc((100%-1.5rem)/3)] md:w-[calc((100%-3rem)/5)] aspect-square p-3 border-2 border-black bg-white dark:bg-neutral-900 shadow-none transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
              >
                {"logo" in platform && platform.logo ? (
                  <img
                    src={platform.logo}
                    alt=""
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain dark:invert"
                    aria-hidden
                  />
                ) : (
                  "Icon" in platform &&
                  platform.Icon && (
                    <platform.Icon className={cn("w-7 h-7 sm:w-8 sm:h-8 shrink-0", platform.color)} />
                  )
                )}
                <span className="text-[11px] sm:text-xs font-bold text-foreground text-center leading-tight">
                  {platform.name}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── Week rhythm ── */}
      <section className="py-16 sm:py-20 px-6 bg-white dark:bg-[#1a1816] border-y border-border/60">
        <div className="max-w-5xl mx-auto space-y-10">
          <FadeIn className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              A week that{" "}
              <span className="text-[#d75a34] italic font-semibold">actually works</span>
            </h2>
            <p className="text-muted-foreground">
              The rhythm when you’re shipping product and still need a pulse on social.
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {weekSteps.map((step, i) => (
              <FadeIn key={step.day} delay={i * 0.06}>
                <div className="border-2 border-black bg-[#FAF7F5] dark:bg-[#1f1d1b] p-5 h-full space-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#d75a34]">
                    {step.day}
                  </p>
                  <h3 className="text-lg font-black text-foreground">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder ── */}
      <section className="py-20 sm:py-24 px-6">
        <FadeIn className="text-center mb-10 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            <span className="block sm:inline">Built by a founder.</span>{" "}
            <span className="block sm:inline text-[#d75a34] italic font-semibold">
              You talk to him.
            </span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.08}>
          <FounderStory />
        </FadeIn>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 sm:py-24 px-6 scroll-mt-24 bg-[#fcf5f3] dark:bg-[#191715]">
        <div className="max-w-3xl mx-auto space-y-10">
          <FadeIn className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Two ways to get{" "}
              <span className="text-[#d75a34] italic font-semibold">Pro</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              This page only sells Pro. Subscribe — or pay once for Lifetime. Same unlimited feature
              set either way.
            </p>
          </FadeIn>

          <FadeIn delay={0.05}>
            <MarketingPricingBillingToggle isAnnual={isAnnual} onAnnualChange={setIsAnnual} />
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <FadeIn delay={0.08}>
              <Card
                className={cn(
                  "relative border-2 border-black rounded-none bg-white dark:bg-[#1f1d1b] overflow-hidden flex flex-col h-full",
                  pricingCardHover
                )}
              >
                <div className="bg-[#d75a34] text-white text-[11px] font-bold py-1.5 px-4 text-center tracking-wider uppercase border-b-2 border-black">
                  7-day free trial · then billed
                </div>
                <CardContent className="p-6 md:p-8 flex flex-col flex-1 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-2xl font-extrabold tracking-tight">Pro</h3>
                      <Badge className="bg-[#d75a34]/10 text-[#d75a34] hover:bg-[#d75a34]/15 border-none rounded-none font-bold uppercase tracking-wider text-[10px] py-1 px-2.5">
                        Subscription
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Unlimited workspaces, accounts, posts, and Studio — no ceilings.
                    </p>
                    <div className="flex items-baseline gap-1 pt-2">
                      <span className="text-5xl font-extrabold font-mono">${proPrice}</span>
                      <span className="text-sm font-bold text-muted-foreground font-mono">
                        {proPriceLabel}
                      </span>
                    </div>
                    {isAnnual && (
                      <p className="text-xs font-bold text-[#d75a34]">Save ~20% vs monthly</p>
                    )}
                  </div>
                  <ul className="space-y-2.5 flex-1">
                    {proPlan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm font-semibold text-foreground/90"
                      >
                        <Check className="w-4 h-4 text-[#d75a34] stroke-[3] mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-2">
                    <Button
                      onClick={handleProSelect}
                      disabled={busyPro}
                      variant="marketing"
                      className="w-full h-12 text-base font-medium"
                    >
                      {busyPro ? "Processing..." : "Start Pro trial"}
                    </Button>
                    <p className="text-[10px] text-muted-foreground font-bold text-center uppercase tracking-wider leading-relaxed">
                      Payment method required · no charge until trial ends
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.12}>
              <Card
                className={cn(
                  "relative border-2 border-black rounded-none bg-gradient-to-b from-white to-[#fff8f5] dark:from-[#1b1512] dark:to-[#11100e] overflow-hidden flex flex-col h-full",
                  pricingCardHover
                )}
              >
                <div className="bg-black text-white text-[11px] font-bold py-1.5 px-4 text-center tracking-wider uppercase border-b-2 border-black">
                  Limited · first 50 people
                </div>
                <CardContent className="p-6 md:p-8 flex flex-col flex-1 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-2xl font-extrabold tracking-tight">Lifetime Pro</h3>
                      <Badge className="bg-[#d75a34]/10 text-[#d75a34] hover:bg-[#d75a34]/15 border-none rounded-none font-bold uppercase tracking-wider text-[10px] py-1 px-2.5">
                        One-time
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Pay once. Keep full Pro forever — updates and priority human support included.
                    </p>
                    <div className="flex items-baseline gap-2 pt-2">
                      <span className="text-5xl font-extrabold font-mono">$299</span>
                      <span className="text-sm font-bold text-muted-foreground line-through font-mono">
                        $588/yr value
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 flex-1">
                    {[
                      "Everything in Pro, forever",
                      "No recurring subscription fees",
                      "Free lifetime software updates",
                      "Priority human support",
                      "7-day refund guarantee",
                    ].map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm font-semibold text-foreground/90"
                      >
                        <Check className="w-4 h-4 text-[#d75a34] stroke-[3] mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-2">
                    <Button
                      onClick={handleLifetimeSelect}
                      disabled={busyLifetime}
                      variant="marketing"
                      className="w-full h-12 text-base font-medium"
                    >
                      {busyLifetime ? "Processing..." : "Get Lifetime Pro"}
                    </Button>
                    <p className="text-[10px] text-[#d75a34] font-extrabold text-center uppercase tracking-wider">
                      Only 50 spots · full 7-day refund
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Want Starter or Creator too? See{" "}
            <Link to="/pricing" className="text-[#d75a34] underline underline-offset-2 font-semibold">
              all pricing
            </Link>
            . Comparing tools?{" "}
            <Link
              to="/compare/buffer"
              className="text-[#d75a34] underline underline-offset-2 font-semibold"
            >
              ShipOS vs Buffer
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 sm:py-24 px-6 scroll-mt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <FadeIn className="text-center">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">FAQ</h2>
          </FadeIn>
          <FadeIn delay={0.05}>
            <div className="divide-y divide-border border-y border-border">
              {faqs.map((faq, i) => (
                <div key={faq.question} className="py-5">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    className="w-full flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="font-bold text-foreground group-hover:text-[#d75a34] transition-colors pr-4 text-left">
                      {faq.question}
                    </span>
                    <span className="text-[#d75a34] text-xl font-bold shrink-0">
                      {openFaqIndex === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaqIndex === i && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Final close ── */}
      <section className="pb-24 px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto border-2 border-black bg-white dark:bg-[#1f1d1b] p-10 sm:p-14 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Stop losing launch weeks to tabs.
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Start the Pro trial tonight — or lock Lifetime if you already know you’ll keep shipping
              in public.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={handleProSelect}
                disabled={busyPro}
                variant="marketing"
                className="h-12 px-8 text-base font-medium"
              >
                {busyPro ? (
                  "Processing..."
                ) : (
                  <>
                    Start 7-day Pro trial <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <Button
                variant="marketingOutline"
                className="h-12 px-8 text-base font-medium"
                onClick={handleLifetimeSelect}
                disabled={busyLifetime}
              >
                {busyLifetime ? "Processing..." : "Lifetime Pro — $299"}
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1">
              {platforms.map((platform) =>
                "logo" in platform && platform.logo ? (
                  <span key={platform.name} title={platform.name} className="inline-flex" aria-label={platform.name}>
                    <img
                      src={platform.logo}
                      alt=""
                      className="w-5 h-5 object-contain dark:invert"
                      aria-hidden
                    />
                  </span>
                ) : (
                  "Icon" in platform &&
                  platform.Icon && (
                    <span key={platform.name} title={platform.name} className="inline-flex" aria-label={platform.name}>
                      <platform.Icon className={cn("w-5 h-5", platform.color)} />
                    </span>
                  )
                )
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-bold tracking-wide">
              Payment method required for trial · no charge until trial ends
            </p>
          </div>
        </FadeIn>
      </section>

      <div className="relative z-50">
        <Footer />
      </div>
    </div>
  );
}
