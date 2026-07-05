import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Check, CheckCircle2, Layers } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FreeToolPricingSection } from "@/components/FreeToolPricingSection";
import {
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  softwareApplicationSchema,
} from "@/lib/seo";

const SectionBadge = ({
  label,
  text,
  mobileText,
}: {
  label: string;
  text: string;
  mobileText?: string;
}) => (
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

const supportedPlatforms = [
  "X (Twitter)",
  "LinkedIn",
  "Instagram",
  "TikTok",
  "Threads",
  "Facebook",
  "Bluesky",
  "Pinterest",
  "YouTube",
];

const capabilities = [
  {
    title: "Post creation and editing",
    detail:
      "Draft posts, edit text, and prepare platform-ready content from a single composer workflow.",
  },
  {
    title: "AI-assisted drafting",
    detail:
      "Use AI assistance to generate and refine post ideas, hooks, and copy before scheduling.",
  },
  {
    title: "Calendar scheduling",
    detail:
      "Plan and schedule posts in a calendar interface instead of managing one post at a time.",
  },
  {
    title: "Bulk queue import",
    detail:
      "Import multiple posts from CSV, TSV, or plain text files through the bulk scheduler.",
  },
  {
    title: "Workspace separation",
    detail:
      "Use separate workspaces for brands, clients, or teams so content and accounts stay organized.",
  },
  {
    title: "Built-in toolset",
    detail:
      "Use free utility tools (formatters, checkers, calculators, and previewers) to prepare stronger content.",
  },
];

const faqs = [
  {
    question: "What is an AI social media scheduler?",
    answer:
      "An AI social media scheduler helps you generate post ideas, draft content, and schedule posts across platforms from one place. ShipOS combines AI drafting, calendar scheduling, and multi-platform publishing in a single workflow.",
  },
  {
    question: "Which platforms can I schedule from ShipOS?",
    answer:
      "ShipOS supports scheduling for X, LinkedIn, Instagram, TikTok, Threads, Facebook, Bluesky, Pinterest, and YouTube. You can manage multiple accounts and workspaces from one dashboard.",
  },
  {
    question: "Can I bulk schedule content?",
    answer:
      "Yes. You can import posts with CSV, TSV, or text files using the bulk scheduler and queue a full content calendar in minutes.",
  },
  {
    question: "Can I preview and validate posts before scheduling?",
    answer:
      "Yes. ShipOS includes utility tools such as character-limit checking and platform-specific formatting/preview workflows so you can validate post quality before publishing.",
  },
  {
    question: "Is ShipOS useful for agencies and teams?",
    answer:
      "Yes. ShipOS supports multi-workspace setups so agencies and teams can separate client brands, collaboration, and publishing flows.",
  },
];

export default function AiSocialMediaScheduler() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="AI Social Media Scheduler | ShipOS"
        description="Plan, generate, and schedule social media posts with AI. ShipOS helps creators, founders, and agencies publish faster across X, LinkedIn, Instagram, TikTok, Threads, Facebook, Bluesky, Pinterest, and YouTube."
        path="/ai-social-media-scheduler"
        type="website"
        keywords={[
          "ai social media scheduler",
          "social media scheduling tool",
          "ai content scheduler",
          "multi platform scheduler",
          "social media calendar tool",
        ]}
        jsonLd={[
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "AI Social Media Scheduler", path: "/ai-social-media-scheduler" },
          ]),
          faqSchema(faqs),
          howToSchema({
            name: "How to schedule social media posts with AI",
            description:
              "Generate, edit, and schedule social posts across multiple social networks using ShipOS.",
            path: "/ai-social-media-scheduler",
            steps: [
              {
                name: "Draft your post",
                text: "Use ShipOS AI tools to generate a post draft and hook for your topic.",
              },
              {
                name: "Select channels and schedule time",
                text: "Pick your social accounts and choose a date and time from the visual content calendar.",
              },
              {
                name: "Publish and track",
                text: "ShipOS publishes the post and helps you monitor results from one dashboard.",
              },
            ],
          }),
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-16">
        <section className="max-w-6xl mx-auto px-6 text-center mb-14">
          <SectionBadge
            label="Commercial Page"
            text="AI social media scheduler"
            mobileText="AI scheduler"
          />
          <h1 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            AI Social Media Scheduler: Detailed Product Overview
          </h1>
          <p className="mt-5 text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            This page explains exactly what ShipOS does for social media scheduling: content
            drafting, AI assistance, multi-platform scheduling, queue management, and
            workflow organization for creators, founders, and agencies.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/signup")}
              variant="marketing"
            >
              Start Free 7-Day Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="marketingOutline" onClick={() => navigate("/pricing")}>
              View Pricing
            </Button>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16 grid md:grid-cols-3 gap-5">
          <div className="border border-border bg-card p-6 space-y-3">
            <CalendarDays className="w-5 h-5 text-[#d75a34]" />
            <h2 className="text-lg font-bold">Visual calendar scheduling</h2>
            <p className="text-sm text-muted-foreground">
              Plan weekly and monthly publishing in one place using a calendar-based workflow.
            </p>
          </div>
          <div className="border border-border bg-card p-6 space-y-3">
            <Layers className="w-5 h-5 text-[#d75a34]" />
            <h2 className="text-lg font-bold">Cross-platform publishing</h2>
            <p className="text-sm text-muted-foreground">
              Manage scheduling for multiple platforms from one dashboard and one queue.
            </p>
          </div>
          <div className="border border-border bg-card p-6 space-y-3">
            <CheckCircle2 className="w-5 h-5 text-[#d75a34]" />
            <h2 className="text-lg font-bold">Bulk scheduling support</h2>
            <p className="text-sm text-muted-foreground">
              Import CSV, TSV, or text drafts to schedule many posts without manual copy/paste.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">What ShipOS does</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {capabilities.map((item) => (
              <div key={item.title} className="border border-border bg-card p-5">
                <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Supported platforms</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            ShipOS supports scheduling workflows across the following platforms:
          </p>
          <div className="grid sm:grid-cols-3 md:grid-cols-3 gap-3">
            {supportedPlatforms.map((platform) => (
              <div key={platform} className="border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground">
                {platform}
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Typical workflow</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-border bg-card p-5">
              <p className="text-xs font-bold tracking-wider text-[#d75a34] uppercase">Step 1</p>
              <h3 className="mt-2 text-base font-bold text-foreground">Draft and refine content</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Write posts in the composer, then use AI assistance and free formatting tools
                to improve clarity, hooks, and platform fit.
              </p>
            </div>
            <div className="border border-border bg-card p-5">
              <p className="text-xs font-bold tracking-wider text-[#d75a34] uppercase">Step 2</p>
              <h3 className="mt-2 text-base font-bold text-foreground">Schedule single or bulk posts</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Add posts one by one in the calendar, or import multiple items with CSV/TSV/text
                when planning a larger content cycle.
              </p>
            </div>
            <div className="border border-border bg-card p-5">
              <p className="text-xs font-bold tracking-wider text-[#d75a34] uppercase">Step 3</p>
              <h3 className="mt-2 text-base font-bold text-foreground">Monitor queue and outputs</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Track scheduled and posted items, then iterate based on what performs best
                in your content workflow.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border bg-card p-6 md:p-7">
              <h2 className="text-2xl font-black text-foreground mb-4">Who this is for</h2>
              <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#d75a34] font-bold">-</span>
                  <span>Founders building audience while shipping product</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d75a34] font-bold">-</span>
                  <span>Agencies managing multiple client brands and channels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d75a34] font-bold">-</span>
                  <span>Creators who need a repeatable weekly publishing system</span>
                </li>
              </ul>
            </div>

            <div className="border border-border bg-card p-6 md:p-7">
              <h2 className="text-2xl font-black text-foreground mb-4">Information boundaries (no overclaims)</h2>
              <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#d75a34] font-bold">-</span>
                  <span>This page describes product capabilities visible in the app flows and current routes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d75a34] font-bold">-</span>
                  <span>It does not claim guaranteed reach, algorithm boosts, or guaranteed follower growth.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d75a34] font-bold">-</span>
                  <span>Outcomes depend on content quality, audience fit, frequency, and channel strategy.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d75a34] font-bold">-</span>
                  <span>Use the scheduler as a workflow system, then measure performance and improve weekly.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-[#141413] border-t border-b border-border/40 relative z-10 mb-16">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
            <div className="space-y-3">
              <SectionBadge label="Demo Video" text="See the workflow in action" />
              <h2 className="text-3xl font-black text-foreground tracking-tight">Product walkthrough</h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Watch a full walkthrough of planning, scheduling, and publishing across channels.
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
                  <img
                    src="https://img.youtube.com/vi/huwiFpCP614/maxresdefault.jpg"
                    alt="ShipOS Platform Demo Preview"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center transition-colors duration-300 group-hover:bg-black/35">
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

        <FreeToolPricingSection
          variant="platform"
          className="mb-16"
          description="Choose a plan based on account volume, workspace needs, and posting cadence."
          onCtaClick={() => navigate("/signup")}
        />

        <section className="max-w-4xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Frequently asked questions</h2>
          <div className="divide-y divide-border border-y border-border">
            {faqs.map((faq, i) => (
              <div key={faq.question} className="py-4">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-bold text-foreground">{faq.question}</span>
                  <span className="text-[#d75a34] text-lg font-bold ml-4">
                    {openFaqIndex === i ? "-" : "+"}
                  </span>
                </button>
                {openFaqIndex === i && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6">
          <h2 className="text-xl font-black text-foreground mb-4">Related pages</h2>
          <div className="grid sm:grid-cols-4 gap-4 text-sm">
            <Link to="/" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              ShipOS homepage overview
            </Link>
            <Link to="/pricing" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              Social media scheduler pricing
            </Link>
            <Link to="/compare/buffer" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              Buffer alternative comparison
            </Link>
            <Link to="/free-tools" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              Free social media tools suite
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
