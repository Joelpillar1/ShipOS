import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight, ChevronDown, Sparkles, Scale, DollarSign, Calendar, Layers, ShieldCheck, Users, HelpCircle, BarChart3, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { PLANS } from "@/lib/plans";
import {
  breadcrumbSchema,
  softwareApplicationSchema,
  faqSchema,
} from "@/lib/seo";

// Reusable components
const FadeIn = ({ children, delay = 0, direction = "up", className = "" }: { children: React.ReactNode, delay?: number, direction?: "up" | "down" | "left" | "right" | "none", className?: string }) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 }
  };
  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const SectionBadge = ({ label, text }: { label: string; text: string }) => (
  <div className="inline-flex items-center gap-2 border border-[#d75a34]/60 rounded-full p-1 pr-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm shadow-sm mb-6 max-w-full">
    <div className="bg-gradient-to-b from-[#e36e4b] to-[#d75a34] text-white text-[13px] font-bold px-3 py-1 rounded-full shadow-inner shrink-0 whitespace-nowrap">
      {label}
    </div>
    <span className="text-[13px] font-semibold text-gray-800 dark:text-neutral-200 tracking-wide whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
      {text}
    </span>
  </div>
);

const SOCIAL_BADGES = [
  {
    name: "Twitter / X",
    bg: "bg-black",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    bg: "bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    bg: "bg-[#0077B5]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    bg: "bg-[#1877F2]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    bg: "bg-black",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    bg: "bg-[#FF0000]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
        <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 00.502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 002.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 002.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Bluesky",
    bg: "bg-[#0285FF]",
    icon: (
      <svg viewBox="0 0 320 286" className="w-4 h-4 fill-white">
        <path d="M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.949-86.633 90.636-114.439C277.126-.453 320-16.446 320 34.908c0 10.362-2.182 45.474-5.32 57.062-7.591 28.058-39.027 34.61-68.514 29.544 48.163 12.28 63.856 46.104 29.544 76.16-30.706 26.892-74.996 16.273-115.71 16.273-40.714 0-85.004 10.619-115.71-16.273-34.312-30.056-18.619-63.88 29.544-76.16-29.487 5.066-60.923-1.486-68.514-29.544C2.182 80.382 0 45.27 0 34.908 0-16.446 42.874-.453 69.364 19.146Z" />
      </svg>
    ),
  },
  {
    name: "Threads",
    bg: "bg-black",
    icon: (
      <svg viewBox="0 0 16 16" className="w-4 h-4 fill-white">
        <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161" />
      </svg>
    ),
  },
  {
    name: "Pinterest",
    bg: "bg-[#BD081C]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
        <path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.12.115.226.085.345-.093.389-.301 1.224-.341 1.391-.054.221-.179.268-.413.16-1.545-.719-2.51-2.977-2.51-4.793 0-3.902 2.836-7.487 8.174-7.487 4.293 0 7.629 3.059 7.629 7.148 0 4.265-2.689 7.697-6.422 7.697-1.254 0-2.435-.651-2.839-1.42l-.772 2.94c-.28 1.066-1.037 2.403-1.542 3.226C8.854 23.834 10.373 24 12 24c6.63 0 12-5.373 12-12S18.63 0 12 0z" />
      </svg>
    ),
  },
];

export default function CompareHootsuite() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  const faqs = [
    {
      question: "What are the main differences between ShipOS and Hootsuite?",
      answer: "The core differences are in pricing model, interface philosophy, and target user. Hootsuite is built for enterprise teams — its Standard plan starts at $99/month (billed annually) for a single user with up to 10 accounts, and its Team plan is $249/month for 3 users. Approval workflows and client workspaces are gated to higher tiers. ShipOS takes the opposite approach: flat-rate plans starting at $19/month (Starter) give you isolated Brand Workspaces for multiple clients, a built-in Slideshow Studio for native carousel creation, and team collaboration without per-seat charges.",
    },
    {
      question: "Did Hootsuite remove their free plan?",
      answer: "Yes. Hootsuite officially discontinued its free plan on March 31, 2023. Users who previously relied on the free tier were required to subscribe to a paid plan starting at $99/month (billed annually) or stop using the platform. The decision triggered significant backlash from freelancers, small business owners, and independent creators who felt the pricing was prohibitive. Today, Hootsuite only offers a 30-day free trial — no permanent free tier exists.",
    },
    {
      question: "Is ShipOS good for agencies managing multiple clients?",
      answer: "Yes — it's one of ShipOS's primary design goals. Each client gets a dedicated Brand Workspace: an isolated environment with its own connected social accounts, content calendar, media library, and posting queue. This eliminates the risk of cross-client publishing errors (accidentally publishing Client A's content on Client B's channels), which is a real operational risk on Hootsuite's Standard plan where all accounts share a single stream. On ShipOS, client partitioning is available from the Starter plan — not just enterprise.",
    },
    {
      question: "Does ShipOS have a native carousel or slideshow builder?",
      answer: "Yes. ShipOS includes a built-in Slideshow Studio that lets you design multi-slide carousels directly inside the post composer — drag and drop slides, set transitions, add text and media per slide, then publish to Instagram and LinkedIn without leaving the app. Hootsuite supports scheduling carousel posts (multi-image upload via the official Instagram API), but it does not include a native slide design tool. Hootsuite users typically design slides in Canva or Adobe Express (which Hootsuite integrates with), export each image, then upload them manually.",
    },
    {
      question: "What social platforms does each tool support?",
      answer: "Both tools support the major platforms: Instagram, Facebook, X (Twitter), LinkedIn, TikTok, Pinterest, YouTube, Threads, and Bluesky. Hootsuite added Bluesky support in late 2025. ShipOS has supported Bluesky natively since launch, alongside all other major platforms. Neither platform supports Mastodon or decentralized networks at this time.",
    },
    {
      question: "Is the price difference between Hootsuite and ShipOS really that significant?",
      answer: "For small teams and agencies, yes — dramatically so. A freelancer managing 10 client accounts pays $29/month on ShipOS's Creator plan. The equivalent on Hootsuite would be the Standard plan at $99/month (1 user, 10 accounts) — 3.4× more expensive. An agency needing 20 accounts pays $49/month on ShipOS's Pro plan versus $249/month on Hootsuite's Team plan — a 5× cost difference. Over a full year, an agency choosing ShipOS over Hootsuite's Team plan saves approximately $2,400.",
    },
    {
      question: "When should I choose Hootsuite over ShipOS?",
      answer: "Hootsuite makes the most sense for large enterprise organizations that require deep social listening (powered by their Talkwalker acquisition), Salesforce or HubSpot CRM synchronization, SSO for corporate compliance, or complex multi-department approval chains with hundreds of team members. If you work in a Fortune 500 marketing department where budget is secondary to feature depth and compliance certification, Hootsuite remains a strong choice. But for the vast majority of independent creators, marketing freelancers, and agencies under 50 people, the ROI math strongly favors ShipOS.",
    },
  ];

  return (
    <div className="min-h-screen text-foreground relative overflow-hidden font-sans bg-background">
      <SEO
        title="ShipOS vs Hootsuite (2025): Honest Comparison — Pricing, Features & Who Should Switch"
        description="A detailed, fact-checked comparison of Hootsuite and ShipOS covering 2025 pricing, feature depth, agency use-cases, carousel tools, analytics, and who each platform is actually built for."
        path="/compare/hootsuite"
        type="article"
        keywords={["ShipOS vs Hootsuite", "Hootsuite alternative 2025", "Hootsuite pricing too expensive", "flat rate social media scheduler", "best social media scheduler for agencies", "Hootsuite free plan removed", "Hootsuite carousel scheduling"]}
        jsonLd={[
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare Hootsuite", path: "/compare/hootsuite" },
          ]),
          faqSchema(faqs),
        ]}
      />

      <Header />

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-6 lg:px-8 max-w-7xl mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <SectionBadge label="2025 Analysis" text="Fact-Checked Feature & Pricing Comparison" />

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1A1A1A] dark:text-neutral-100 leading-tight">
            ShipOS vs Hootsuite:<br />
            <span className="text-[#d75a34]">An Honest, Detailed Breakdown</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground font-semibold max-w-3xl mx-auto leading-relaxed">
            Hootsuite has been the dominant social media management platform since 2008. But after its 2023 free plan removal, two price hikes, and a pivot toward enterprise buyers, a new generation of tools has emerged to serve creators, agencies, and lean marketing teams better. This article compares both platforms on real, verifiable data — pricing, features, and actual user experience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              id="hero-cta-btn"
              onClick={() => navigate("/signup")}
              className="w-full sm:w-auto px-8 h-14 bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none font-bold text-base transition-all shadow-[0_6px_20px_rgba(215,90,52,0.25)] border-none"
            >
              Try ShipOS Free for 7 Days <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <a
              href="#comparison-table"
              className="text-sm font-bold text-foreground hover:text-primary transition-colors py-2 px-4"
            >
              Jump to Feature Matrix ↓
            </a>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-12 px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <FadeIn delay={0.1}>
          <div className="relative rounded-none border-2 border-black dark:border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-card overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-8 bg-black flex items-center px-3 gap-2 border-b-2 border-black z-20">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              <div className="ml-2 text-white/90 text-[10px] font-bold tracking-widest uppercase">ShipOS — Interactive Social Content Calendar</div>
            </div>
            <img
              src="/shipos_calendar_preview.png"
              alt="ShipOS Social Media Calendar showing monthly scheduled posts and client cross-publishing queue"
              className="w-full h-auto object-cover mt-8 aspect-[16/9]"
            />
          </div>
        </FadeIn>
      </section>

      {/* Hootsuite Pricing History Context */}
      <section className="py-16 px-6 lg:px-8 border-t border-border bg-card/10 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <SectionBadge label="Context" text="What Changed at Hootsuite" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground">The Hootsuite Pricing Shift You Need to Know</h2>
          </div>
          <div className="space-y-5 text-sm font-semibold text-muted-foreground leading-relaxed">
            <p>
              For most of its history, Hootsuite was the default answer to "what tool should I use for social media scheduling?" It was widely adopted by agencies and solo marketers alike — in large part because it offered a functional free tier that let users get started without any financial commitment.
            </p>
            <p>
              That changed on <strong className="text-foreground">March 31, 2023</strong>, when Hootsuite removed its free plan entirely. Users who had relied on the free tier were given notice that they must upgrade to a paid plan or stop using the platform. The entry-level paid plan at the time was $99/month billed annually — a steep cliff for someone previously paying $0.
            </p>
            <p>
              The backlash was immediate and significant. Reddit threads, G2 reviews, and Trustpilot complaints spiked. The sentiment was consistent: small businesses, independent creators, and freelancers felt the platform had outgrown them. The framing was explicit — Hootsuite was repositioning itself as an enterprise product.
            </p>
            <p>
              As of 2025, Hootsuite's pricing structure has three tiers: <strong className="text-foreground">Standard at $99/month</strong> (1 user, up to 10 accounts, billed annually), <strong className="text-foreground">Team at $249/month</strong> (up to 3 users, up to 20 accounts, billed annually), and <strong className="text-foreground">Enterprise</strong> at custom pricing. No free tier. No monthly billing option on lower tiers.
            </p>
          </div>
        </div>
      </section>

      {/* Factual Pros & Cons Matrix */}
      <section className="py-16 px-6 lg:px-8 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <SectionBadge label="Evaluation" text="Verified Pros & Cons" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">What Each Platform Does Well — And Where It Falls Short</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ShipOS */}
          <Card className="border-2 border-black dark:border-neutral-800 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-card text-left">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Sparkles className="w-6 h-6 text-[#d75a34]" />
                <h3 className="text-2xl font-bold text-foreground">ShipOS</h3>
                <span className="ml-auto text-[10px] font-bold bg-[#d75a34]/10 text-[#d75a34] px-2 py-0.5 rounded-full uppercase tracking-wider">Modern</span>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-2">Key Advantages (Pros)</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Flat-rate pricing: $19/mo (Starter), $29/mo (Creator, 15 accounts), $49/mo (Pro, unlimited accounts); price never scales with user count.",
                      "Isolated Brand Workspaces available on all plans; each client gets their own calendar, queue, and media library.",
                      "Native Slideshow Studio: design multi-slide LinkedIn and Instagram carousels directly in the post composer without leaving the app.",
                      "Real-time CSV bulk upload validator to paste or import hundreds of posts and see format errors flagged before you submit.",
                      "Supports X, Instagram, LinkedIn, TikTok, Facebook, Threads, Bluesky, Pinterest, and YouTube from a single publisher.",
                      "7-day free trial to evaluate the full product.",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm font-semibold text-foreground/90">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2">
                  <h4 className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-2">Limitations (Cons)</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Does not offer enterprise SSO, advanced audit logs, or corporate compliance certifications required by Fortune 500 marketing departments.",
                      "No native Salesforce, HubSpot, or CRM integration (ShipOS is a publisher and scheduler, not a CRM-linked enterprise suite).",
                      "Social listening (brand monitoring, sentiment tracking, competitor benchmarking) is basic keyword tracking rather than AI-powered sentiment analytics.",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm font-semibold text-muted-foreground">
                        <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hootsuite */}
          <Card className="border-2 border-black dark:border-neutral-800 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-card text-left">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Scale className="w-6 h-6 text-neutral-500" />
                <h3 className="text-2xl font-bold text-foreground">Hootsuite</h3>
                <span className="ml-auto text-[10px] font-bold bg-neutral-400/10 text-neutral-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Enterprise</span>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-2">Key Advantages (Pros)</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Industry-leading social listening via Talkwalker integration, with AI-powered sentiment tracking, crisis alerts, and competitor benchmarking for brands monitoring at scale.",
                      "Deep CRM integrations: native connectors for Salesforce, HubSpot, Microsoft Dynamics, Zendesk, and Asana.",
                      "Established enterprise compliance: SSO support, role-based permissions, and audit logging for large multi-department organizations.",
                      "Broad third-party app ecosystem: 150+ app integrations via the Hootsuite App Directory.",
                      "Bulk scheduling up to 350 posts at once with Best Time to Publish AI recommendations.",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm font-semibold text-foreground/90">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2">
                  <h4 className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-2">Limitations (Cons)</h4>
                  <ul className="space-y-2.5">
                    {[
                      "No free plan since March 2023. Entry price is $99/month (annual) for 1 user and 10 accounts, which is unusable for solo creators on a budget.",
                      "Content approval workflows and advanced team collaboration are locked to the $249/month Team plan; Standard plan users cannot build multi-person review chains.",
                      "No native slide or document carousel designer; users must use Canva or Adobe Express externally and upload finished images.",
                      "Client workspace separation is not available on Standard or Team plans and requires an Enterprise upgrade.",
                      "Trustpilot reviews consistently flag difficulty canceling subscriptions and receiving refunds, which is a well-documented customer service concern.",
                      "\"Streams\" UI is frequently criticized as cluttered and overwhelming for daily publishing tasks as it is designed for monitoring rather than clean editorial flow.",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm font-semibold text-muted-foreground">
                        <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Users Switch Section */}
      <section className="py-16 px-6 lg:px-8 border-t border-border bg-card/10 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <SectionBadge label="Real Feedback" text="Why Hootsuite Users Switch in 2025" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground text-center">The Three Most Common Reasons People Leave Hootsuite</h2>
          </div>

          <div className="space-y-5">
            {[
              {
                title: "1. The $99/month Entry Price Is Simply Too High for Most Creators and Freelancers",
                body: "After Hootsuite killed its free plan in March 2023, the only way to access the platform is to pay at least $99/month on an annual contract — roughly $1,188/year. For a freelance social media manager who handles 3-4 clients, that subscription cost directly eats into their margin. The irony is that the Standard plan's single-user, 10-account structure doesn't even support a typical freelancer's workflow — they'd need the $249/month Team plan to get approval workflows and more accounts. ShipOS's Creator plan at $29/month covers 15 accounts with Brand Workspaces: a $70/month saving per month, $840 per year.",
              },
              {
                title: "2. The Interface Was Built for Social Listening, Not Content Publishing",
                body: "Hootsuite's core UX is organized around \"Streams\" — live columns of social feeds you monitor. This is powerful for community management and brand monitoring, but it creates friction for the most common daily task: drafting and publishing a post. Users on Reddit and G2 consistently describe the experience of finding the 'New Post' button inside the streams dashboard as non-intuitive. ShipOS flips this — the primary interface is the content calendar and composer queue. Publishing is the first-class workflow, not monitoring.",
              },
              {
                title: "3. Growing a Team Gets Expensive Immediately",
                body: "The Standard plan supports exactly 1 user. If you want a second person to have their own login — even just a junior assistant — you must jump to the $249/month Team plan, which accommodates up to 3 users. If your team grows to 4 people, you're looking at Enterprise pricing (custom quote, typically $5,000+/year). ShipOS doesn't charge per seat. A team of 5 people managing one workspace pays the same flat rate as a solo operator. This makes ShipOS the obvious choice for agencies scaling their headcount without a linear increase in software costs.",
              },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-background border border-border">
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Loop Deep Dive */}
      <section className="py-16 px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <SectionBadge label="Deep Dive" text="Feature-by-Feature Walkthrough" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How the Core Features Actually Compare</h2>
        </div>

        <div className="space-y-12">
          {/* Loop 1: Content Scheduling */}
          <div className="grid md:grid-cols-2 gap-8 items-start border-b border-border pb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-[#d75a34]" />
                <h3 className="text-xl font-bold text-foreground">Content Scheduling & Queue</h3>
              </div>
              <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                <strong className="text-foreground">ShipOS:</strong> Visual calendar queue with drag-and-drop rescheduling. Each client workspace has its own isolated calendar — you never mix Client A's Twitter queue with Client B's. Bulk CSV import with real-time error validation. Unlimited posts on all plans.
                <br /><br />
                <strong className="text-foreground">Hootsuite:</strong> Powerful publisher with planner and calendar views. AI-powered "Best Time to Post" recommendations. Bulk scheduling of up to 350 posts at once. However, content approval workflows — where a manager must approve a draft before it goes live — require the $249/month Team plan. On the $99/month Standard plan, there is no approval chain.
              </p>
            </div>
            <div className="bg-muted p-6 border border-border text-xs font-mono rounded-none">
              <span className="font-bold text-[#d75a34] block mb-3">// Scheduling Access by Plan</span>
              <p className="mb-2 text-foreground/80"><strong>ShipOS Starter ($19/mo):</strong> Unlimited posts, calendar view, 1 workspace</p>
              <p className="mb-2 text-foreground/80"><strong>ShipOS Creator ($29/mo):</strong> 5 workspaces, 15 accounts, bulk CSV</p>
              <p className="mb-2 text-foreground/80"><strong>Hootsuite Standard ($99/mo):</strong> 1 user, 10 accounts, no approvals</p>
              <p className="text-foreground/80"><strong>Hootsuite Team ($249/mo):</strong> 3 users, 20 accounts, approval workflows</p>
            </div>
          </div>

          {/* Loop 2: Carousel & Creative Tools */}
          <div className="grid md:grid-cols-2 gap-8 items-start border-b border-border pb-10">
            <div className="order-last md:order-first bg-muted p-6 border border-border text-xs font-mono rounded-none">
              <span className="font-bold text-[#d75a34] block mb-3">// Carousel Creation Workflow</span>
              <p className="mb-2 text-foreground/80"><strong>ShipOS:</strong> Design slides → preview → schedule → publish (all in one tab)</p>
              <p className="mb-2 text-foreground/80"><strong>Hootsuite:</strong> Design in Canva/Adobe Express → export images → upload to composer → schedule</p>
              <p className="text-foreground/50 mt-3 italic">ShipOS saves an estimated 15–25 min per carousel post by eliminating the external design round-trip.</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Edit3 className="w-5 h-5 text-[#d75a34]" />
                <h3 className="text-xl font-bold text-foreground">Carousel & Content Creation</h3>
              </div>
              <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                <strong className="text-foreground">ShipOS:</strong> Ships with a native Slideshow Studio. You build carousel slides directly inside the post composer — choose layout, add text, drop in images, preview the finished carousel, then schedule. No external app required.
                <br /><br />
                <strong className="text-foreground">Hootsuite:</strong> Supports carousel scheduling for Instagram and Facebook via the official APIs. But Hootsuite does not have a native slide designer — you must create slide images outside the platform (via their Canva or Adobe Express integrations, or your own tool), download them, and upload each image individually into the carousel composer. The scheduling works reliably; the design workflow requires context-switching.
              </p>
            </div>
          </div>

          {/* Loop 3: Analytics */}
          <div className="grid md:grid-cols-2 gap-8 items-start border-b border-border pb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-[#d75a34]" />
                <h3 className="text-xl font-bold text-foreground">Analytics & Performance Reporting</h3>
              </div>
              <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                <strong className="text-foreground">ShipOS:</strong> Per-workspace analytics with dual-axis charts. Because views (often 10,000+) and engagements (often 100–500) live on completely different scales, ShipOS renders them on independent Y-axes so engagement bars don't become invisible 1-pixel slivers. Analytics are available on all plans.
                <br /><br />
                <strong className="text-foreground">Hootsuite:</strong> One of Hootsuite's genuine strengths. Standard plan includes basic post performance data and benchmarking against up to 5 competitors. Advanced plan unlocks custom report builders, scheduled report delivery, and comparison against up to 20 competitors. For large organizations needing deep insight across many channels, Hootsuite's analytics remain best-in-class.
              </p>
            </div>
            <div className="bg-muted p-6 border border-border text-xs font-mono rounded-none">
              <span className="font-bold text-[#d75a34] block mb-3">// Analytics Access by Plan</span>
              <p className="mb-2 text-foreground/80"><strong>ShipOS (all plans):</strong> Dual-axis platform charts, per-workspace breakdown</p>
              <p className="mb-2 text-foreground/80"><strong>Hootsuite Standard:</strong> Basic metrics, 5-competitor benchmark</p>
              <p className="mb-2 text-foreground/80"><strong>Hootsuite Team:</strong> Custom reports, 20-competitor benchmark</p>
              <p className="text-foreground/80"><strong>Hootsuite Enterprise:</strong> Full social listening, sentiment, AI-powered insights</p>
            </div>
          </div>

          {/* Loop 4: Client Workspaces */}
          <div className="grid md:grid-cols-2 gap-8 items-start pb-6">
            <div className="order-last md:order-first bg-muted p-6 border border-border text-xs font-mono rounded-none">
              <span className="font-bold text-[#d75a34] block mb-3">// Multi-Client Management</span>
              <p className="mb-2 text-foreground/80"><strong>ShipOS Starter:</strong> 1 workspace</p>
              <p className="mb-2 text-foreground/80"><strong>ShipOS Creator:</strong> 5 isolated workspaces</p>
              <p className="mb-2 text-foreground/80"><strong>ShipOS Pro:</strong> Unlimited workspaces</p>
              <p className="mb-2 text-foreground/80"><strong>Hootsuite Standard:</strong> No workspace separation</p>
              <p className="text-foreground/80"><strong>Hootsuite Enterprise:</strong> Organizations with workspace-level isolation</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-5 h-5 text-[#d75a34]" />
                <h3 className="text-xl font-bold text-foreground">Multi-Client Brand Workspaces</h3>
              </div>
              <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                <strong className="text-foreground">ShipOS:</strong> Every paid plan includes at least one Brand Workspace — a fully isolated environment with its own connected accounts, calendar, drafts, and media. For agencies, Workspaces eliminate the risk of cross-client publishing errors. On the Creator plan, you get 5 workspaces; on Pro, unlimited.
                <br /><br />
                <strong className="text-foreground">Hootsuite:</strong> The Standard and Team plans do not include client-level workspace separation. All connected accounts live in a single shared environment. Organizations-level separation (equivalent to workspaces) is an Enterprise-only feature. This is one of the most frequently cited limitations for agencies using Hootsuite's mid-tier plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison-table" className="py-16 px-6 lg:px-8 border-t border-border bg-card/20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <SectionBadge label="Metrics" text="Side-by-Side Feature Matrix" />
            <h2 className="text-3xl font-bold tracking-tight">ShipOS vs Hootsuite: Full Breakdown</h2>
            <p className="text-sm text-muted-foreground font-semibold mt-2">All pricing reflects annual billing. Data verified against official Hootsuite pricing page and ShipOS plan documentation.</p>
          </div>

          <div className="overflow-x-auto border-2 border-black dark:border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b border-black dark:border-neutral-800 font-bold text-xs sm:text-sm tracking-wide text-foreground">
                  <th className="p-4 sm:p-6">Feature</th>
                  <th className="p-4 sm:p-6 bg-primary/5 text-primary border-x border-black dark:border-neutral-800 text-center">ShipOS</th>
                  <th className="p-4 sm:p-6 text-center">Hootsuite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm font-semibold">
                {[
                  ["Entry-Level Price", "$19/mo (Starter, annual)", "$99/mo (Standard, annual)"],
                  ["Mid-Tier Price (15–20 accounts)", "$29/mo (Creator)", "$249/mo (Team)"],
                  ["Free Plan", "No (7-day free trial)", "No (removed March 2023)"],
                  ["Max Users (Mid-Tier)", "Unlimited (flat-rate)", "3 users"],
                  ["Client Brand Workspaces", "✓ From Starter plan", "Enterprise only"],
                  ["Content Approval Workflows", "✓ Included", "Team plan & above only ($249/mo)"],
                  ["Native Carousel Builder", "✓ Slideshow Studio", "No (Canva/Adobe integration)"],
                  ["Bulk CSV Scheduling", "✓ All plans", "✓ Team plan & above"],
                  ["Social Listening", "Basic keyword tracking", "Advanced (Talkwalker) (Enterprise)"],
                  ["Bluesky Support", "✓ Supported", "✓ Supported (added late 2025)"],
                  ["CRM Integrations", "Not included", "Salesforce, HubSpot, Dynamics"],
                  ["Dual-Axis Analytics Charts", "✓ All plans", "Not applicable"],
                  ["SSO / Enterprise Compliance", "Not available", "✓ Enterprise plan"],
                  ["Trial Period", "7 days", "30 days (card required on some plans)"],
                ].map(([feature, shipos, hootsuite], i) => (
                  <tr key={i}>
                    <td className="p-4 sm:p-6">
                      <span className="font-bold text-foreground">{feature}</span>
                    </td>
                    <td className="p-4 sm:p-6 bg-primary/5 border-x border-black dark:border-neutral-800 text-center text-foreground">
                      {shipos}
                    </td>
                    <td className="p-4 sm:p-6 text-center text-muted-foreground">
                      {hootsuite}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Real Cost Comparison */}
      <section className="py-16 px-6 lg:px-8 border-t border-border relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SectionBadge label="Math" text="Real Annual Cost Comparison" />
            <h2 className="text-3xl font-bold tracking-tight">What You Actually Pay Per Year</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                persona: "Solo Creator",
                accounts: "5–10 accounts",
                shipos: "$19/mo × 12 = $228/yr",
                hootsuite: "$99/mo × 12 = $1,188/yr",
                saving: "Save $960/yr",
              },
              {
                persona: "Freelance Agency",
                accounts: "15 accounts, multi-client",
                shipos: "$29/mo × 12 = $348/yr",
                hootsuite: "$249/mo × 12 = $2,988/yr",
                saving: "Save $2,640/yr",
              },
              {
                persona: "Growing Team",
                accounts: "Unlimited accounts",
                shipos: "$49/mo × 12 = $588/yr",
                hootsuite: "Enterprise = custom ($5,000+/yr est.)",
                saving: "Save $4,400+/yr",
              },
            ].map((item, i) => (
              <div key={i} className="p-6 border-2 border-black dark:border-neutral-800 bg-background rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-base font-black text-foreground mb-1">{item.persona}</h3>
                <p className="text-xs text-muted-foreground font-semibold mb-4">{item.accounts}</p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#d75a34] font-bold">ShipOS:</span>
                    <span className="text-foreground">{item.shipos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-bold">Hootsuite:</span>
                    <span className="text-muted-foreground">{item.hootsuite}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <span className="text-emerald-500 font-black text-sm">{item.saving}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Should Use Which */}
      <section className="py-16 px-6 lg:px-8 border-t border-border bg-card/5 relative z-10">
        <div className="max-w-4xl mx-auto text-left">
          <div className="text-center mb-10">
            <SectionBadge label="Decision Guide" text="Matching Platforms to Your Actual Needs" />
            <h2 className="text-3xl font-bold tracking-tight text-center text-foreground">Who Should Use Hootsuite vs ShipOS?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 border-2 border-black dark:border-neutral-800 bg-background rounded-none">
              <h3 className="text-lg font-bold text-neutral-500 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Choose Hootsuite if:
              </h3>
              <ul className="space-y-3 text-sm font-semibold text-muted-foreground leading-relaxed">
                {[
                  "You work for an enterprise brand where social media is integrated with Salesforce or HubSpot CRM pipelines.",
                  "Your organization requires SSO, corporate audit logs, or compliance certifications that are standard in regulated industries.",
                  "You need AI-powered social listening at scale — tracking brand sentiment across millions of mentions with crisis alerting.",
                  "You are running paid media campaigns alongside organic and need unified paid + organic analytics in one dashboard.",
                  "Your organization has 10+ team members managing social and needs structured multi-level approval chains.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-foreground">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 border-2 border-[#d75a34] bg-[#d75a34]/5 dark:bg-[#d75a34]/10 rounded-none">
              <h3 className="text-lg font-bold text-[#d75a34] mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Choose ShipOS if:
              </h3>
              <ul className="space-y-3 text-sm font-semibold text-muted-foreground leading-relaxed">
                {[
                  "You are a freelance social media manager, content creator, or independent marketing consultant managing multiple client brands.",
                  "You want predictable, flat-rate pricing that doesn't scale with team size — add team members without watching your monthly bill double.",
                  "You need proper client workspace separation without paying enterprise prices — each client gets their own isolated environment.",
                  "You build LinkedIn carousels, Instagram slideshow posts, or multi-slide content regularly and don't want to context-switch to Canva for every piece.",
                  "You're running a lean marketing agency (2–20 people) that wants professional-grade publishing tools at a price that protects your margins.",
                  "You value a clean, publisher-first interface over a monitoring-first dashboard.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#d75a34]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How to Switch Section */}
      <section className="py-16 px-6 lg:px-8 border-t border-border relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SectionBadge label="Migration Guide" text="Step-by-Step Switching Instructions" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              How to Switch from Hootsuite to ShipOS
            </h2>
            <p className="text-sm text-muted-foreground font-semibold mt-3 max-w-2xl mx-auto leading-relaxed">
              Most teams complete the full migration in under two hours. Here is the exact process, from canceling Hootsuite to publishing your first post on ShipOS.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Export Your Hootsuite Scheduled Content",
                body: "Before canceling Hootsuite, export any scheduled posts that have not yet gone live. In Hootsuite, go to Publisher, filter by Scheduled status, and use the bulk export option to download a CSV of upcoming posts including caption text, scheduled dates, and target accounts. This file becomes the basis for your ShipOS bulk import. Keep this CSV — ShipOS's Bulk Schedule tool accepts it directly after minor column formatting (date format: YYYY-MM-DD HH:MM, platform names lowercased).",
                icon: <HelpCircle className="w-4 h-4 text-[#d75a34]" />,
              },
              {
                step: "02",
                title: "Create Your Brand Workspaces in ShipOS",
                body: "Sign up for ShipOS and create a Brand Workspace for each client you currently manage in Hootsuite. In ShipOS, go to Workspaces and click New Workspace. Name it after your client and assign a colour. Each workspace is completely isolated — its own calendar, queue, media library, and analytics. If you are on the Creator plan, you get 5 workspaces; on Pro, unlimited. This step replaces Hootsuite's shared-stream model with a clean per-client structure.",
                icon: <Layers className="w-4 h-4 text-[#d75a34]" />,
              },
              {
                step: "03",
                title: "Reconnect Your Social Accounts",
                body: "In each workspace, connect the social accounts that belong to that client. Go to Connections within the workspace, and authenticate with Instagram, Facebook, X (Twitter), LinkedIn, TikTok, Pinterest, YouTube, Threads, or Bluesky. ShipOS uses official platform APIs — the same connections Hootsuite uses — so you are not revoking anything unusual. Most accounts reconnect in under 60 seconds. Once connected, the accounts are scoped exclusively to that workspace and cannot accidentally post to another client's channels.",
                icon: <Users className="w-4 h-4 text-[#d75a34]" />,
              },
              {
                step: "04",
                title: "Import Your Scheduled Posts via CSV Bulk Upload",
                body: "Take the CSV you exported from Hootsuite and upload it using ShipOS's Bulk Schedule tool. ShipOS validates your CSV in real time and flags any rows with formatting issues before you submit. Required columns are: date, time, platform, caption, and (optionally) image URL. Once validated, all posts are added to the correct workspace calendar. For posts with images, you can upload media to ShipOS's Media Library first and reference file names in the CSV, or attach images individually after import.",
                icon: <BarChart3 className="w-4 h-4 text-[#d75a34]" />,
              },
              {
                step: "05",
                title: "Cancel Hootsuite Before Your Next Billing Date",
                body: "Once your content and accounts are live in ShipOS, cancel your Hootsuite subscription before the next renewal date to avoid being charged. In Hootsuite, go to Account Settings, then My Plan, and select Cancel Subscription. Hootsuite requires you to complete a cancellation flow — do not just remove your payment method, as that can lead to delinquent charges. Screenshot your cancellation confirmation. Note: Hootsuite does not offer pro-rated refunds on annual plans, so time your migration to happen near the start of your billing cycle.",
                icon: <DollarSign className="w-4 h-4 text-[#d75a34]" />,
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.08} direction="up">
                <div className="flex gap-5 p-6 border border-border bg-background hover:border-[#d75a34]/40 transition-colors duration-200">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="w-10 h-10 border-2 border-[#d75a34] flex items-center justify-center bg-[#d75a34]/5">
                      <span className="text-[10px] font-black text-[#d75a34] tracking-widest">{item.step}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="mt-8 p-5 border border-[#d75a34]/30 bg-[#d75a34]/5 text-sm font-semibold text-foreground/80 leading-relaxed">
            <strong className="text-[#d75a34]">Total migration time:</strong> Most teams complete steps 1 through 4 in 90 minutes or less. The only time variable is re-authenticating social accounts, which takes 1–2 minutes per account. A team managing 10 client accounts across 3 platforms can typically be fully live on ShipOS within a single afternoon.
          </div>
        </div>
      </section>

      {/* Demo Video Box */}
      <section className="relative z-20 py-16 md:py-24 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <SectionBadge label="Demo" text="Watch ShipOS in Action" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground">See how it works</h2>
        </div>
        <FadeIn delay={0.2}>
         <div
           onClick={isPlayingDemo ? undefined : () => setIsPlayingDemo(true)}
           className={cn(
             "relative w-full aspect-video bg-[#fbf4f2] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center group overflow-hidden rounded-none",
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
               <div className="absolute top-0 left-0 w-full h-8 bg-black flex items-center px-3 gap-2 border-b-2 border-black z-20">
                 <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                 <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                 <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                 <div className="ml-2 text-white/90 text-[10px] font-bold tracking-widest">ShipOS_Platform_Demo.mp4</div>
               </div>
               <img
                 src="https://img.youtube.com/vi/huwiFpCP614/maxresdefault.jpg"
                 alt="ShipOS Platform Demo Preview"
                 className="absolute inset-0 w-full h-full object-cover mt-8 group-hover:scale-[1.02] transition-transform duration-500"
                 />
               <div className="absolute inset-0 mt-8 bg-black/45 flex items-center justify-center transition-colors duration-300 group-hover:bg-black/35">
                 <div className="relative z-10 w-20 h-20 bg-[#d75a34] rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                   <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M8 5v14l11-7z" />
                   </svg>
                 </div>
               </div>
             </>
           )}
         </div>
        </FadeIn>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 lg:px-8 border-t border-border relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <SectionBadge label="Pricing" text="Simple flat-rate pricing" />
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Predictable Flat-Rate Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-semibold">
              One price, unlimited team members. No per-seat surprises as you grow.
            </p>

            <div className="flex items-center justify-center gap-4 bg-muted/80 border border-border rounded-none p-1 w-fit mx-auto shadow-sm">
              <span
                className={cn("text-xs font-bold tracking-wider px-4 py-1.5 rounded-none transition-colors cursor-pointer", !isAnnual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-primary"
              />
              <span
                className={cn("text-xs font-bold tracking-wider px-4 py-1.5 rounded-none transition-colors cursor-pointer flex items-center", isAnnual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
                onClick={() => setIsAnnual(true)}
              >
                Annual Billing
                <Badge className="bg-primary/15 text-primary border-transparent rounded-none text-[8.5px] font-bold py-0.5 px-2 ml-2 shadow-none">
                  Save 20%
                </Badge>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch max-w-6xl mx-auto">
            {PLANS.map((plan) => {
              return (
                <Card
                  key={plan.name}
                  className={cn(
                    "relative border-border bg-card shadow-none rounded-none overflow-hidden transition-all duration-300 flex flex-col justify-between h-full",
                    plan.popular ? "ring-2 ring-primary bg-primary/[0.02]" : "hover:border-primary/30"
                  )}
                >
                  {plan.badge && (
                    <div className={cn(
                      "absolute top-4 right-4 text-[8px] font-bold tracking-wider px-2.5 py-1 rounded-none shadow-sm",
                      plan.popular ? "bg-primary text-white" : "bg-foreground text-background"
                    )}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-8 flex-1 flex flex-col justify-between text-left bg-background/30">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground tracking-tight mb-1">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground font-medium">{plan.description}</p>
                      </div>

                      <div className="border-t border-b border-border/60 py-4 flex items-baseline">
                        {isAnnual ? (
                          <div className="flex items-baseline space-x-2 flex-wrap">
                            <span className="text-4xl font-bold text-foreground font-mono">${plan.price.annual}</span>
                            <span className="text-xs font-semibold text-muted-foreground mr-2">/year</span>
                            <span className="text-sm font-medium text-muted-foreground/60 line-through font-mono">
                              ${plan.price.monthly * 12}
                            </span>
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-none ml-1">
                              Save 20%
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-baseline space-x-1">
                            <span className="text-4xl font-bold text-foreground font-mono">${plan.price.monthly}</span>
                            <span className="text-xs font-semibold text-muted-foreground">/month</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <span className="text-xs font-bold tracking-wider text-muted-foreground block">Includes Features:</span>
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-start space-x-2 text-sm font-semibold text-foreground/90">
                            <Check className="w-4 h-4 text-primary stroke-[3] mt-0.5 flex-shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate("/signup")}
                      className={cn(
                        "w-full h-12 rounded-none shadow-sm hover:shadow transition-all font-bold text-sm normal-case tracking-wider mt-8 flex items-center justify-center gap-2",
                        plan.popular ? "bg-primary hover:bg-primary/95 text-white" : "bg-background hover:bg-muted text-foreground border border-border"
                      )}
                    >
                      Try it for $0 (7-days) <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 lg:px-8 border-t border-border/80 bg-card/5 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <SectionBadge label="FAQ" text="Frequently Asked Questions" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Common Questions About Switching From Hootsuite
            </h2>
            <p className="text-base text-muted-foreground font-semibold mt-2">
              Fact-checked answers for every question you should ask before committing to a social management platform.
            </p>
          </div>

          <div className="divide-y divide-border/60 text-left">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="py-5 first:pt-0 last:pb-0">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center text-left focus:outline-none py-2 group"
                  >
                    <span className={cn(
                      "text-base font-bold transition-colors pr-6 leading-snug",
                      isOpen ? "text-[#d75a34]" : "text-foreground group-hover:text-[#d75a34]"
                    )}>
                      {faq.question}
                    </span>
                    <ChevronDown className={cn(
                      "w-5 h-5 text-neutral-400 transition-all duration-300 flex-shrink-0",
                      isOpen ? "text-[#d75a34] rotate-180" : "group-hover:text-foreground"
                    )} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-2 pt-3 text-sm font-semibold text-muted-foreground/80 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Block */}
      <section className="py-24 px-6 lg:px-8 relative z-10">
        <div className="max-w-[1000px] mx-auto relative">
          <div className="relative rounded-none bg-white dark:bg-[#1c1917] border-x-2 border-b-2 border-t-[8px] border-x-black border-b-black border-t-[#d75a34] dark:border-x-neutral-800 dark:border-b-neutral-800 p-10 md:p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)] flex flex-col items-center">

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.2] text-[#1c2024] dark:text-neutral-100 mb-6 max-w-4xl">
              Ready to try the modern alternative to Hootsuite?
            </h2>

            <p className="text-gray-600 dark:text-neutral-400 text-sm sm:text-base md:text-lg font-medium max-w-3xl mx-auto leading-relaxed mb-8">
              Get a full 7-day trial. Connect your channels, set up your client workspaces, and schedule your first week of content in under an hour.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-2 mb-10 select-none">
              {SOCIAL_BADGES.map((badge, idx) => (
                <div
                  key={idx}
                  className={`w-9 h-9 rounded-none flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] ${badge.bg}`}
                  title={badge.name}
                >
                  {badge.icon}
                </div>
              ))}
            </div>

            <button
              id="cta-bottom-btn"
              onClick={() => navigate("/signup")}
              className="h-14 px-8 bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none border-2 border-black dark:border-neutral-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(215,90,52,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 font-bold text-base tracking-wide flex items-center justify-center gap-2"
            >
              Start Free Trial →
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}