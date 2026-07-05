import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Clock3,
  Globe,
  MessageSquare,
  PenTool,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FreeToolPricingSection } from "@/components/FreeToolPricingSection";
import {
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  softwareApplicationSchema,
  webPageSchema,
} from "@/lib/seo";

const CANONICAL_PATH = "/bluesky-post-scheduler";

const BlueskyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 320 286" aria-hidden>
    <path d="M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.949-86.633 90.636-114.439C277.126-.453 320-16.446 320 34.908c0 10.362-2.182 45.474-5.32 57.062-7.591 28.058-39.027 34.61-68.514 29.544 48.163 12.28 63.856 46.104 29.544 76.16-30.706 26.892-74.996 16.273-115.71 16.273-40.714 0-85.004 10.619-115.71-16.273-34.312-30.056-18.619-63.88 29.544-76.16-29.487 5.066-60.923-1.486-68.514-29.544C2.182 80.382 0 45.27 0 34.908 0-16.446 42.874-.453 69.364 19.146Z" />
  </svg>
);

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

const BLUESKY_KEYWORDS = [
  "bluesky post scheduler",
  "schedule bluesky posts",
  "bluesky scheduling tool",
  "bluesky content calendar",
  "automate bluesky posts",
  "bluesky scheduler",
  "bluesky social media scheduler",
  "post scheduler bluesky",
  "bluesky marketing",
  "bluesky growth",
  "schedule posts on bluesky",
  "bluesky planner",
  "social media scheduling tools",
  "open social scheduling",
];

const faqs = [
  {
    question: "What is the best way to schedule Bluesky posts?",
    answer:
      "Draft your posts in batches, validate each against the 300-character limit (including full URL length), assign slots on a content calendar, and publish through an official API-connected scheduler like ShipOS. That keeps your bluesky posting schedule consistent without manual daily logins.",
  },
  {
    question: "Does ShipOS support Bluesky text and image posts?",
    answer:
      "Yes. ShipOS connects Bluesky accounts through direct OAuth publishing so you can schedule text posts and images from one queue — with per-platform character validation built in before publish.",
  },
  {
    question: "How is Bluesky scheduling different from X?",
    answer:
      "Bluesky posts are capped at 300 characters and URLs count at their full length — unlike X's t.co shortening. ShipOS validates copy per platform so you never schedule a post that truncates on Bluesky.",
  },
  {
    question: "Why do creators use ShipOS for Bluesky?",
    answer:
      "Many schedulers still omit Bluesky. ShipOS includes native Bluesky publishing alongside X, LinkedIn, Instagram, and other channels — so tech, media, and indie creators can cross-post without a separate tool.",
  },
  {
    question: "Is there a free trial for Bluesky scheduling?",
    answer:
      "ShipOS offers a 7-day free trial on all paid plans. A payment method is required at signup, but you won't be charged until the trial ends.",
  },
  {
    question: "How does ShipOS compare to Buffer for Bluesky?",
    answer:
      "ShipOS includes active Bluesky channel API support with direct OAuth publishing. Buffer does not currently support Bluesky scheduling. See our Buffer comparison page for a full feature breakdown.",
  },
];

const freeTools = [
  { label: "Social Post Limit Checker", path: "/social-post-limit-checker" },
  { label: "Twitter / X Text Formatter", path: "/twitter-text-formatter" },
  { label: "X Engagement Calculator", path: "/x-engagement-calculator" },
];

const useCases = [
  {
    icon: Globe,
    title: "Tech & media creators",
    body: "Build an audience on the open social web with a fixed weekly rhythm — punchy posts and link shares queued in advance while you publish on other channels.",
  },
  {
    icon: Target,
    title: "Indie founders & builders",
    body: "Share product updates, build-in-public notes, and community wins on a bluesky content calendar without rewriting copy from X every time.",
  },
  {
    icon: Users,
    title: "Agencies & social teams",
    body: "Isolate each client in a workspace, schedule bluesky posts per brand, and keep short-form approvals in one queue with the rest of their stack.",
  },
];

const features = [
  {
    icon: CalendarDays,
    title: "Visual posting calendar",
    body: "Map your bluesky posting schedule across weeks. Drag, edit, and spot gaps before they become missed publishing days.",
  },
  {
    icon: PenTool,
    title: "AI copy studio",
    body: "Draft and refine short-form posts with AI assistance — tuned for Bluesky's 300-character limit before you schedule.",
  },
  {
    icon: MessageSquare,
    title: "Character limit validation",
    body: "Catch over-limit copy before publish. ShipOS counts URLs at full length so nothing gets truncated in the Bluesky feed.",
  },
  {
    icon: BarChart3,
    title: "Publishing analytics",
    body: "Track what went live, what failed, and how your bluesky scheduling output compares week over week.",
  },
];

const algorithmTips = [
  {
    title: "Lead with a sharp hook",
    body: "With only 300 characters, every word counts. Open with a specific claim, question, or outcome — not a slow wind-up.",
  },
  {
    title: "Account for link length",
    body: "Bluesky does not shorten URLs like X. A long link can eat your entire post budget. ShipOS validates character counts including full URL length before scheduling.",
  },
  {
    title: "Post on a fixed cadence",
    body: "Consistency builds feed presence. A bluesky posting schedule of 3–5 quality posts per week outperforms sporadic bursts for most creator accounts.",
  },
  {
    title: "Engage when posts go live",
    body: "Scheduled publishing frees you to reply and quote when posts publish. Early replies signal active conversation to discovery feeds.",
  },
];

export default function BlueskyPlatform() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Bluesky Post Scheduler & Content Calendar"
        description="Schedule Bluesky posts, plan your content calendar, and grow on the open social web with ShipOS — calendar scheduling, 300-char validation, AI copy, and multi-platform publishing in one tool."
        path={CANONICAL_PATH}
        type="website"
        keywords={BLUESKY_KEYWORDS}
        jsonLd={[
          webPageSchema({
            name: "Bluesky Post Scheduler & Content Calendar",
            description:
              "Schedule Bluesky posts, plan your content calendar, and grow on the open social web with ShipOS.",
            path: CANONICAL_PATH,
            about: "Bluesky post scheduling",
            keywords: BLUESKY_KEYWORDS,
          }),
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Bluesky", path: CANONICAL_PATH },
          ]),
          faqSchema(faqs),
          howToSchema({
            name: "How to schedule Bluesky posts with ShipOS",
            description:
              "Plan, draft, and schedule Bluesky content for consistent publishing using ShipOS.",
            path: CANONICAL_PATH,
            steps: [
              {
                name: "Connect your Bluesky account",
                text: "Link your Bluesky profile through ShipOS Connections via direct OAuth.",
              },
              {
                name: "Draft and validate copy",
                text: "Write in Create Post or Content Studio. Use the Post Limit Checker to stay within 300 characters.",
              },
              {
                name: "Assign calendar slots",
                text: "Pick dates and times on the visual calendar to build your bluesky posting schedule.",
              },
              {
                name: "Publish and engage",
                text: "ShipOS publishes via the official API. Reply and quote when posts go live to boost reach.",
              },
            ],
          }),
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-20">
        <section className="max-w-6xl mx-auto px-6 text-center mb-16">
          <SectionBadge
            label="Platform"
            text="Bluesky scheduling & content planning"
            mobileText="Bluesky scheduling"
          />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
            Bluesky Post Scheduler for{" "}
            <span className="text-[#d75a34]">Open Social</span> Growth
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A <strong className="font-semibold text-foreground">bluesky post scheduler</strong> lets
            you queue posts on the open social web ahead of time. ShipOS is a bluesky scheduling tool
            for creators and brands — schedule posts, validate 300-character copy, and publish on a
            fixed calendar from one dashboard for tech, media, and indie builders.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => navigate("/signup")} variant="marketing" className="h-12 px-8">
              Start 7-Day Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="rounded-none h-12 px-8 font-bold"
              onClick={() => navigate("/social-media-calendar-tool")}
            >
              See scheduling workflow
            </Button>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-20">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground text-center mb-3">
            Everything you need for Bluesky scheduling
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            From bluesky content calendar planning to bulk queue uploads — ShipOS covers the full
            post scheduler workflow for the open social web.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="border-2 border-border bg-card p-6 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)] hover:border-primary/40 transition-colors"
              >
                <Icon className="w-5 h-5 text-[#d75a34] mb-3" />
                <h3 className="text-base font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-[#141413] border-y border-border py-16 mb-20">
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-4">
                Build a bluesky content calendar that ships
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Most bluesky growth stalls from inconsistency, not bad ideas. ShipOS turns your
                strategy into a repeatable posting schedule: plan themes by week, batch short-form
                copy in Content Studio, and queue everything before Monday.
              </p>
              <ul className="space-y-3">
                {[
                  "Schedule bluesky posts weeks ahead on the visual calendar",
                  "Repurpose one idea across Bluesky, X, and Threads",
                  "Bulk-upload content batches via CSV for campaign sprints",
                  "Validate 300-character limits including full URL length",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 text-[#d75a34] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 rounded-none font-bold"
                onClick={() => navigate("/social-post-limit-checker")}
              >
                Check character limits
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="border-2 border-border bg-[#FAF7F5] dark:bg-neutral-900 p-8 rounded-none space-y-6">
              <div className="flex items-center gap-2 text-[#d75a34]">
                <Clock3 className="w-5 h-5" />
                <span className="text-xs font-bold tracking-widest uppercase">
                  Sample posting schedule
                </span>
              </div>
              {[
                { day: "Monday", type: "Build-in-public update", time: "9:30 AM" },
                { day: "Wednesday", type: "Link share with hot take", time: "12:00 PM" },
                { day: "Thursday", type: "Community question", time: "6:00 PM" },
                { day: "Saturday", type: "Repurposed X thread opener", time: "10:00 AM" },
              ].map((slot) => (
                <div
                  key={slot.day}
                  className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">{slot.day}</p>
                    <p className="text-[11px] text-muted-foreground">{slot.type}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{slot.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-20">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground text-center mb-3">
            Bluesky posting basics for schedulers
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            Scheduling does not replace good copy — it gives you the consistency and bandwidth to
            publish posts the feed can actually distribute. These principles apply whether you post
            manually or through ShipOS.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {algorithmTips.map(({ title, body }) => (
              <div key={title} className="border border-border bg-card p-6 rounded-none">
                <h3 className="text-base font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-20">
          <h2 className="text-2xl font-black text-foreground mb-8 text-center">
            Who uses ShipOS for Bluesky?
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {useCases.map(({ icon: Icon, title, body }) => (
              <div key={title} className="border-2 border-border bg-card p-6 rounded-none">
                <Icon className="w-6 h-6 text-[#d75a34] mb-4" />
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-[#141413] border-y border-border py-14 mb-20">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-1.5 text-[#d75a34] mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest uppercase">Free tools</span>
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3">
              Free tools for Bluesky copy — no signup required
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8">
              Validate character limits and format short-form copy before you schedule bluesky posts
              in ShipOS.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {freeTools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="inline-flex items-center gap-2 border-2 border-border bg-card px-5 py-2.5 text-sm font-bold rounded-none hover:border-primary/50 transition-colors"
                >
                  {tool.label}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ))}
              <Link
                to="/free-tools"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#d75a34] hover:underline px-3"
              >
                All free tools
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-[#141413] border-t border-b border-border/40 relative z-10 mb-20">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
            <div className="space-y-3">
              <SectionBadge label="Demo Video" text="Bluesky scheduling walkthrough" />
              <h2 className="text-3xl font-black text-foreground tracking-tight">
                See the workflow in action
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Watch how creators and brands draft, queue, and schedule Bluesky posts from one
                ShipOS dashboard.
              </p>
            </div>

            <div
              onClick={isPlayingDemo ? undefined : () => setIsPlayingDemo(true)}
              className={cn(
                "relative w-full aspect-video bg-[#fbf4f2] border-2 border-black dark:border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)] flex items-center justify-center group overflow-hidden rounded-none mx-auto",
                !isPlayingDemo &&
                  "cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
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
                />
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
          description="Bluesky scheduling is included on every plan — plus AI studio, character validation, bulk queue, and multi-platform publishing."
          onCtaClick={() => navigate("/signup")}
        />

        <section className="max-w-3xl mx-auto px-6 mb-20">
          <h2 className="text-2xl font-black text-foreground text-center mb-8">
            Bluesky scheduling FAQs
          </h2>
          <div className="divide-y divide-border border-y border-border">
            {faqs.map((faq, i) => (
              <div key={faq.question} className="py-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  aria-expanded={openFaqIndex === i}
                >
                  <span className="font-bold text-foreground pr-4">{faq.question}</span>
                  <span className="text-[#d75a34] text-lg font-bold shrink-0">
                    {openFaqIndex === i ? "−" : "+"}
                  </span>
                </button>
                {openFaqIndex === i && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6">
          <div className="rounded-none bg-white dark:bg-[#1c1917] border-x-2 border-b-2 border-t-[8px] border-x-black border-b-black border-t-[#d75a34] dark:border-x-neutral-800 dark:border-b-neutral-800 p-10 md:p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)] flex flex-col items-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative flex items-center justify-center gap-3 sm:gap-5 mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0285FF] border-2 border-black dark:border-neutral-700 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(2,133,255,0.4)]">
                <BlueskyIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-foreground leading-none px-1">×</span>
              <div className="h-14 sm:h-16 px-4 sm:px-5 bg-[#FAF7F5] dark:bg-neutral-900 border-2 border-black dark:border-neutral-700 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(215,90,52,0.2)]">
                <img
                  src="/logo-black.png"
                  alt="ShipOS"
                  className="h-7 sm:h-8 w-auto object-contain dark:hidden"
                />
                <img
                  src="/logo-white.png"
                  alt="ShipOS"
                  className="h-7 sm:h-8 w-auto object-contain hidden dark:block"
                />
              </div>
            </div>

            <h2 className="relative text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground leading-[1.15] mb-4 max-w-2xl">
              Start your <span className="text-[#0285FF]">Bluesky</span> posting schedule today
            </h2>
            <p className="relative text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed mb-8">
              Join creators and builders using ShipOS for bluesky scheduling — native OAuth
              publishing, copy validation, and 9 platforms from one tool.
            </p>

            <div className="relative flex flex-wrap items-center justify-center gap-2 mb-10">
              {["Direct OAuth publishing", "300-char validation", "Bulk CSV queue"].map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-1.5 border border-border bg-[#FAF7F5] dark:bg-neutral-900 px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-muted-foreground"
                >
                  <Check className="w-3 h-3 text-[#d75a34]" />
                  {pill}
                </span>
              ))}
            </div>

            <div className="relative flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Button onClick={() => navigate("/signup")} variant="marketing" className="h-12 px-8">
                Start 7-Day Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="marketingOutline"
                className="h-12 px-8"
                onClick={() => navigate("/pricing")}
              >
                View pricing
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
