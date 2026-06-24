import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight, ChevronDown, Sparkles, Scale, DollarSign, Calendar, Layers, Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useTheme } from "next-themes";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { PLANS } from "@/lib/plans";
import {
  breadcrumbSchema,
  softwareApplicationSchema,
  faqSchema,
} from "@/lib/seo";


// Reusable SectionBadge component
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
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
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

export default function CompareBuffer() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  const faqs = [
    {
      question: "Is ShipOS really cheaper than Buffer?",
      answer: "Yes, for almost all use cases except solo creators with 1 to 2 accounts. Because Buffer charges a linear rate of $6 to $12 per connected channel each month, managing 15 profiles on a team plan runs about $180/mo on Buffer. ShipOS offers a flat $29/mo Creator plan for 15 connected social accounts, representing over 80% savings.",
    },
    {
      question: "Can I migrate my scheduled queue from Buffer to ShipOS?",
      answer: "Yes. While direct API import is restricted by Buffer's API terms, you can export your scheduled queue or drafts from Buffer and import them directly into ShipOS using our native Bulk Scheduler (supporting CSV, TSV, and Text files) in seconds.",
    },
    {
      question: "Does ShipOS support the same social media platforms?",
      answer: "ShipOS supports X (Twitter), LinkedIn, Instagram, TikTok, Threads, Facebook, Bluesky, Pinterest, and YouTube. Buffer supports 9 platforms as well, including Mastodon but excluding Bluesky. With ShipOS, you gain native Bluesky support which is essential for tech, media, and web3 creators.",
    },
    {
      question: "Is OAuth connection safe and compliant?",
      answer: "Absolutely. ShipOS utilizes secure, official OAuth 2.0 integrations provided directly by the platforms. We never store or request your social media passwords, and you can instantly revoke access at any time from your settings or directly from the respective social networks.",
    },
    {
      question: "What is the Slideshow Studio and how does it compare to Buffer?",
      answer: "The ShipOS Slideshow Studio is a built-in carousel editor that allows you to draft, design, and automatically split visual slides and carousels for LinkedIn and Instagram. Buffer does not have a native carousel builder—you have to design them in Canva, download them, and manually upload each slide.",
    },
  ];

  return (
    <div 
      className="min-h-screen text-foreground relative overflow-hidden font-sans bg-background"
      style={{
        backgroundColor: isDark ? "transparent" : "#FAF7F5",
      }}
    >
      <SEO
        title="ShipOS vs Buffer Comparison — Best Flat-Rate Social Media Scheduler"
        description="Factual side-by-side comparison between Buffer and ShipOS. Compare flat-rate pricing models vs per-profile taxes, native slideshow builders, bulk upload, and advanced AI studio."
        path="/compare/buffer"
        type="article"
        keywords={["ShipOS vs Buffer", "Buffer alternative", "flat rate social media scheduler", "bulk scheduling tool", "slideshow studio creator"]}
        jsonLd={[
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare Buffer", path: "/compare/buffer" },
          ]),
          faqSchema(faqs),
        ]}
      />

      <Header />

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-6 lg:px-8 max-w-7xl mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <SectionBadge label="Compare" text="Factual Side-by-Side Analysis" />
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1A1A1A] dark:text-neutral-100 leading-tight">
            Every new client you add<br />
            <span className="text-[#d75a34]">costs you more on Buffer.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground font-semibold max-w-3xl mx-auto leading-relaxed">
            Buffer charges per social channel — so your bill grows every time you scale. ShipOS is a flat monthly rate. Add 10 more accounts and pay the same price.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              id="hero-cta-btn"
              onClick={() => navigate("/signup")}
              className="w-full sm:w-auto px-8 h-14 bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none font-bold text-base transition-all shadow-[0_6px_20px_rgba(215,90,52,0.25)] border-none"
            >
              Start Free 7-Day Trial <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <a
              href="#comparison-table"
              className="text-sm font-bold text-foreground hover:text-primary transition-colors py-2 px-4"
            >
              View detailed comparison ↓
            </a>
          </div>

        </div>
      </section>

      {/* Core Differences Bento Grid */}
      <section className="py-16 px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Pricing */}
          <Card className="border-2 border-black dark:border-neutral-800 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-card text-left">
            <CardContent className="p-8 space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-none flex items-center justify-center border border-emerald-500/25">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Your bill never grows as you scale</h3>
              <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                Buffer charges per connected profile — add a 10th account and your bill grows. ShipOS locks your cost: $29/mo covers 15 accounts, $49/mo covers unlimited. Sign 5 new clients and pay exactly the same.
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Features */}
          <Card className="border-2 border-black dark:border-neutral-800 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-card text-left">
            <CardContent className="p-8 space-y-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-none flex items-center justify-center border border-primary/25">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Build carousels without leaving your browser</h3>
              <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                Buffer has no carousel editor — you design in Canva, export images, then upload each slide manually. ShipOS has a native Slideshow Studio built into the post composer. One tab, start to publish.
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Bulk Schedulers */}
          <Card className="border-2 border-black dark:border-neutral-800 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-card text-left">
            <CardContent className="p-8 space-y-4">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-none flex items-center justify-center border border-blue-500/25">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Schedule a full month in one upload</h3>
              <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                Buffer makes you create every post one-by-one. ShipOS accepts a CSV, TSV, or plain text file with up to 50 posts — dates, captions, channels, and links — and queues your entire calendar in a single click.
              </p>
            </CardContent>
          </Card>

        </div>
      </section>



      {/* Comparison Table Section */}
      <section id="comparison-table" className="py-20 px-6 lg:px-8 border-t border-border bg-card/20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <SectionBadge label="Table" text="Comprehensive Feature Comparison" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              ShipOS vs Buffer: Line-by-Line Breakdown
            </h2>
            <p className="text-base text-muted-foreground font-semibold mt-2">
              Compare prices, limits, and creative capabilities side by side.
            </p>
          </div>

          <div className="overflow-x-auto border-2 border-black dark:border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b border-black dark:border-neutral-800 font-bold text-xs sm:text-sm tracking-wide text-foreground">
                  <th className="p-4 sm:p-6">Feature</th>
                  <th className="p-4 sm:p-6 bg-primary/5 text-primary border-x border-black dark:border-neutral-800 text-center">ShipOS</th>
                  <th className="p-4 sm:p-6 text-center">Buffer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm font-semibold">
                
                {/* Row 1: Pricing Model */}
                <tr>
                  <td className="p-4 sm:p-6">
                    <span className="font-bold text-foreground">Pricing Model</span>
                    <p className="text-xs text-muted-foreground font-normal">How subscription billing is calculated.</p>
                  </td>
                  <td className="p-4 sm:p-6 bg-primary/5 border-x border-black dark:border-neutral-800 text-center text-primary font-bold">
                    Flat Monthly Tiers
                  </td>
                  <td className="p-4 sm:p-6 text-center text-muted-foreground">
                    Per Connected Account / Month
                  </td>
                </tr>

                {/* Row 2: 5 Accounts */}
                <tr>
                  <td className="p-4 sm:p-6">
                    <span className="font-bold text-foreground">Cost for 5 Accounts</span>
                    <p className="text-xs text-muted-foreground font-normal">Total monthly cost for 5 connected social profiles.</p>
                  </td>
                  <td className="p-4 sm:p-6 bg-primary/5 border-x border-black dark:border-neutral-800 text-center text-foreground font-bold">
                    $19/mo <span className="text-xs text-muted-foreground font-normal">(Starter plan)</span>
                  </td>
                  <td className="p-4 sm:p-6 text-center text-muted-foreground">
                    $30/mo <span className="text-xs font-normal">(Essentials)</span> or $60/mo <span className="text-xs font-normal">(Team)</span>
                  </td>
                </tr>

                {/* Row 3: 15 Accounts */}
                <tr>
                  <td className="p-4 sm:p-6">
                    <span className="font-bold text-foreground">Cost for 15 Accounts</span>
                    <p className="text-xs text-muted-foreground font-normal">Total monthly cost for 15 profiles.</p>
                  </td>
                  <td className="p-4 sm:p-6 bg-primary/5 border-x border-black dark:border-neutral-800 text-center text-foreground font-bold">
                    $29/mo <span className="text-xs text-muted-foreground font-normal">(Creator plan)</span>
                  </td>
                  <td className="p-4 sm:p-6 text-center text-muted-foreground">
                    $90/mo <span className="text-xs font-normal">(Essentials)</span> or $180/mo <span className="text-xs font-normal">(Team)</span>
                  </td>
                </tr>

                {/* Row 4: Unlimited Accounts */}
                <tr>
                  <td className="p-4 sm:p-6">
                    <span className="font-bold text-foreground">Cost for Unlimited Accounts</span>
                    <p className="text-xs text-muted-foreground font-normal">Total monthly cost for agencies and massive profile networks.</p>
                  </td>
                  <td className="p-4 sm:p-6 bg-primary/5 border-x border-black dark:border-neutral-800 text-center text-foreground font-bold">
                    $49/mo <span className="text-xs text-muted-foreground font-normal">(Pro plan)</span>
                  </td>
                  <td className="p-4 sm:p-6 text-center text-muted-foreground">
                    Scales Linearly <span className="text-xs font-normal">($1200/mo for 100 profiles on Team)</span>
                  </td>
                </tr>

                {/* Row 5: Carousel Maker */}
                <tr>
                  <td className="p-4 sm:p-6">
                    <span className="font-bold text-foreground">Native Slideshow Maker</span>
                    <p className="text-xs text-muted-foreground font-normal">Build visual multi-image post carousels natively.</p>
                  </td>
                  <td className="p-4 sm:p-6 bg-primary/5 border-x border-black dark:border-neutral-800 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 sm:p-6 text-center">
                    <X className="w-5 h-5 text-rose-500 mx-auto stroke-[3]" />
                  </td>
                </tr>

                {/* Row 6: Bulk Scheduler */}
                <tr>
                  <td className="p-4 sm:p-6">
                    <span className="font-bold text-foreground">Bulk CSV/TSV/Text Schedulers</span>
                    <p className="text-xs text-muted-foreground font-normal">Parse lists of posts via CSV, TSV, or TXT file instantly.</p>
                  </td>
                  <td className="p-4 sm:p-6 bg-primary/5 border-x border-black dark:border-neutral-800 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 sm:p-6 text-center">
                    <X className="w-5 h-5 text-rose-500 mx-auto stroke-[3]" />
                  </td>
                </tr>

                {/* Row 7: AI Credits */}
                <tr>
                  <td className="p-4 sm:p-6">
                    <span className="font-bold text-foreground">AI Content Assistant</span>
                    <p className="text-xs text-muted-foreground font-normal">Generates hooks, outlines, threads, and templates.</p>
                  </td>
                  <td className="p-4 sm:p-6 bg-primary/5 border-x border-black dark:border-neutral-800 text-center text-foreground">
                    Included <span className="text-xs text-muted-foreground font-normal">(100 / 400 / Unlimited Credits)</span>
                  </td>
                  <td className="p-4 sm:p-6 text-center text-muted-foreground">
                    Basic Assistant <span className="text-xs font-normal">(Requires manual subscription add-on)</span>
                  </td>
                </tr>

                {/* Row 8: Workspaces */}
                <tr>
                  <td className="p-4 sm:p-6">
                    <span className="font-bold text-foreground">Workspaces (Multi-brand)</span>
                    <p className="text-xs text-muted-foreground font-normal">Partition content and social tokens by client brand.</p>
                  </td>
                  <td className="p-4 sm:p-6 bg-primary/5 border-x border-black dark:border-neutral-800 text-center text-foreground">
                    1 / 5 / Unlimited Workspaces
                  </td>
                  <td className="p-4 sm:p-6 text-center text-rose-500">
                    No <span className="text-xs text-muted-foreground font-normal">(All profiles linked in one dashboard)</span>
                  </td>
                </tr>

                {/* Row 9: Free Trial */}
                <tr>
                  <td className="p-4 sm:p-6">
                    <span className="font-bold text-foreground">Free Trial</span>
                    <p className="text-xs text-muted-foreground font-normal">Risk-free testing window.</p>
                  </td>
                  <td className="p-4 sm:p-6 bg-primary/5 border-x border-black dark:border-neutral-800 text-center">
                    7 Days <span className="text-xs text-muted-foreground font-normal">(All Tiers)</span>
                  </td>
                  <td className="p-4 sm:p-6 text-center">
                    14 Days <span className="text-xs text-muted-foreground font-normal">(Trial periods vary by tier)</span>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Deep-Dive Article Copy */}
      <section className="py-20 px-6 lg:px-8 max-w-4xl mx-auto text-left relative z-10">
        <article className="prose dark:prose-invert max-w-none space-y-8 font-semibold text-gray-700 dark:text-neutral-300">
          
          <h2 className="text-3xl font-bold text-foreground tracking-tight border-b border-border pb-4">
            The Truth About Pricing: Linear Costs vs. Predictable Flat Rates
          </h2>
          <p className="leading-relaxed">
            Many managers get started with Buffer because it looks cheap at first glance. According to{" "}
            <a href="https://buffer.com/pricing" target="_blank" rel="noopener noreferrer" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity">Buffer's public pricing page</a>,
            the Essentials plan starts at $6/channel/month and the Team plan at $12/channel/month. For a solo creator managing three accounts, that's an affordable $18/mo.
          </p>
          <p className="leading-relaxed">
            The math changes fast for agencies. While Buffer maintains high user satisfaction on platforms like G2 (as seen in public{" "}
            <a href="https://www.g2.com/products/buffer/reviews" target="_blank" rel="noopener noreferrer" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity">Buffer reviews on G2</a>),
            their per-channel model scales costs every time you sign a new client. If you handle 3 client brands across X, LinkedIn, Instagram, TikTok, and Facebook, you have <strong>15 social channels</strong> — meaning your bill balloons quickly.
          </p>
          <p className="leading-relaxed">
            Collaboration features like approval workflows and team permissions require Buffer's <strong>Team Plan</strong> ($12/profile/mo). That's where the cost balloons.
          </p>
          <div className="bg-muted p-6 border-l-4 border-[#d75a34] rounded-none my-6 text-foreground font-bold">
            <p className="mb-2">Let's run the numbers:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Buffer Team Plan: 15 profiles × $12 = <span className="text-[#d75a34]">$180 per month</span></li>
              <li>ShipOS Creator Plan: 15 profiles = <span className="text-[#d75a34]">$29 per month</span> (includes 5 brand workspaces)</li>
              <li><strong>Total Savings: $151/mo ($1,812/yr saved)</strong></li>
            </ul>
          </div>
          <p className="leading-relaxed">
            ShipOS ends the linear scaling tax. The{" "}
            <Link to="/pricing" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity">Creator tier</Link>{" "}
            covers up to 15 accounts for a flat $29/mo. Growing agencies can jump to the Pro tier at $49/mo for unlimited connected accounts and unlimited workspaces.
          </p>

          <h2 className="text-3xl font-bold text-foreground tracking-tight border-b border-border pb-4 pt-8">
            Built-in Media Workflows: Design Directly in the Composer
          </h2>
          <p className="leading-relaxed">
            Buffer is built to queue and distribute content, but it lacks native creative tools. Carousel posts (multi-image slideshows) are among the{" "}
            <a href="https://www.linkedin.com/business/marketing/blog/content-marketing/why-document-posts-on-linkedin-deserve-a-place-in-your-content-strategy" target="_blank" rel="noopener noreferrer" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity">highest-engagement content formats on LinkedIn</a>,
            {" "}yet Buffer has no native carousel builder. You must compile slides in an external tool like Canva, export the images, then re-upload them one by one.
          </p>
          <p className="leading-relaxed">
            ShipOS includes a native{" "}
            <Link to="/slideshow-studio" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity">Slideshow Studio</Link>.
            {" "}Build cards, write per-slide captions, and publish multi-image carousels directly from the post editor — no tab-switching, no external software.
          </p>

          <h2 className="text-3xl font-bold text-foreground tracking-tight border-b border-border pb-4 pt-8">
            Programmatic Uploads: Native CSV/TSV/Text Bulk Scheduler
          </h2>
          <p className="leading-relaxed">
            Buffer has no native bulk file queue parser. Scheduling a full month of content means entering every post one-by-one into their publisher — a time-consuming process for any team managing more than a handful of accounts.
          </p>
          <p className="leading-relaxed">
            ShipOS ships a complete{" "}
            <Link to="/bulk-schedule" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity">Bulk File Scheduler</Link>.
            {" "}Draft up to 50 posts in a CSV, TSV, or plain text file — including content copy, media URLs, publish times, and target channels. Upload your file, resolve any flagged errors in the live validator, and queue your entire content calendar in a single click.
          </p>

          <p className="leading-relaxed text-sm text-muted-foreground border-t border-border/60 pt-6 mt-4">
            <strong className="text-foreground">Further reading:</strong>{" "}
            Explore our{" "}
            <Link to="/free-tools" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity">free social media tools</Link>,
            {" "}review{" "}
            <Link to="/pricing" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity">ShipOS plan pricing</Link>,
            {" "}or learn how{" "}
            <a href="https://buffer.com/resources/social-media-scheduling/" target="_blank" rel="noopener noreferrer" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity">social media scheduling tools differ</a>
            {" "}to make the most informed decision for your workflow.
          </p>

        </article>
      </section>

      {/* Switch in 3 steps */}
      <section className="py-16 px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <SectionBadge label="Migration" text="Switch in minutes, not days" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Leaving Buffer is painless</h2>
          <p className="text-muted-foreground font-semibold mt-2 text-base">Your existing workflow transfers in 3 steps. No data loss, no downtime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
          {[
            {
              step: "01",
              title: "Export your Buffer queue",
              desc: "Download your scheduled posts from Buffer as a CSV. It takes under 2 minutes from your Buffer dashboard.",
            },
            {
              step: "02",
              title: "Connect your social accounts",
              desc: "Authorize your social channels in ShipOS via official OAuth. Each platform takes one click. No passwords stored.",
            },
            {
              step: "03",
              title: "Upload your CSV and go live",
              desc: "Drag your Buffer export into ShipOS's Bulk Scheduler. Validate, adjust times if needed, and publish your whole queue instantly.",
            },
          ].map((s, i) => (
            <div key={i} className="relative flex flex-col gap-3 p-8 border-2 border-black dark:border-neutral-800 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:border-r-0 last:border-r-2">
              <span className="text-5xl font-black text-[#d75a34]/20 leading-none select-none">{s.step}</span>
              <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground font-semibold leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button
            onClick={() => navigate("/signup")}
            className="px-8 h-12 bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none font-bold text-sm transition-all border-none shadow-[0_4px_14px_rgba(215,90,52,0.25)]"
          >
            Switch Now — Free for 7 Days <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Cancel anytime during your trial.</p>
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
            <SectionBadge label="Pricing" text="Simple pricing for all your needs" />
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Pay Less, Post More
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-semibold">
              Start single composer free, toggle annual billing modes to activate active saver rewards.
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
              Got Questions? We Have Answers
            </h2>
            <p className="text-base text-muted-foreground font-semibold mt-2">
              Everything you need to know about switching from Buffer.
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

      {/* Dynamic CTA Block */}
      <section className="py-24 px-6 lg:px-8 relative z-10">
        <div className="max-w-[1000px] mx-auto relative">
          <div className="relative rounded-none bg-white dark:bg-[#1c1917] border-x-2 border-b-2 border-t-[8px] border-x-black border-b-black border-t-[#d75a34] dark:border-x-neutral-800 dark:border-b-neutral-800 p-10 md:p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)] flex flex-col items-center">
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.2] text-[#1c2024] dark:text-neutral-100 mb-6 max-w-4xl">
              Ready to leave Buffer's linear pricing tax?
            </h2>
            
            <p className="text-gray-600 dark:text-neutral-400 text-sm sm:text-base md:text-lg font-medium max-w-3xl mx-auto leading-relaxed mb-8">
              Connect your channels in 5 minutes. Draft, schedule, design carousels, and analyze trends under one flat subscription tier.
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
              Get Started for $0 (7-days) →
            </button>

          </div>
        </div>
      </section>

      {/* Related Comparisons & Internal Links */}
      <section className="py-12 px-6 lg:px-8 border-t border-border bg-card/5 relative z-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-6">More Comparisons</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              to="/compare/hootsuite"
              className="group flex flex-col gap-1.5 p-5 border border-border bg-background hover:border-[#d75a34]/50 hover:bg-[#d75a34]/5 transition-all duration-200"
            >
              <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">vs</span>
              <span className="text-base font-bold text-foreground group-hover:text-[#d75a34] transition-colors">ShipOS vs Hootsuite</span>
              <span className="text-xs font-medium text-muted-foreground leading-relaxed">Pricing, enterprise features, and who should switch.</span>
              <span className="text-xs font-bold text-[#d75a34] mt-1 flex items-center gap-1">Read comparison <ArrowRight className="w-3 h-3" /></span>
            </Link>

            <Link
              to="/pricing"
              className="group flex flex-col gap-1.5 p-5 border border-border bg-background hover:border-[#d75a34]/50 hover:bg-[#d75a34]/5 transition-all duration-200"
            >
              <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">Pricing</span>
              <span className="text-base font-bold text-foreground group-hover:text-[#d75a34] transition-colors">ShipOS Plans</span>
              <span className="text-xs font-medium text-muted-foreground leading-relaxed">Flat-rate plans from $19/month. No per-seat fees.</span>
              <span className="text-xs font-bold text-[#d75a34] mt-1 flex items-center gap-1">See pricing <ArrowRight className="w-3 h-3" /></span>
            </Link>

            <Link
              to="/free-tools"
              className="group flex flex-col gap-1.5 p-5 border border-border bg-background hover:border-[#d75a34]/50 hover:bg-[#d75a34]/5 transition-all duration-200"
            >
              <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">Free Tools</span>
              <span className="text-base font-bold text-foreground group-hover:text-[#d75a34] transition-colors">Free Social Tools</span>
              <span className="text-xs font-medium text-muted-foreground leading-relaxed">Engagement calculators, LinkedIn formatter, and more.</span>
              <span className="text-xs font-bold text-[#d75a34] mt-1 flex items-center gap-1">Explore tools <ArrowRight className="w-3 h-3" /></span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}
