import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CalendarDays,
  Check,
  Clock3,
  FileSpreadsheet,
  Linkedin,
  PenTool,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { MarketingPricingCards } from "@/components/MarketingPricingCards";
import { pricingCardClass, pricingCardPopularClass, pricingGridClass, pricingButtonClass } from "@/lib/marketingButtons";
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

const LINKEDIN_KEYWORDS = [
  "linkedin marketing",
  "linkedin content strategy",
  "linkedin posting schedule",
  "linkedin personal branding",
  "linkedin b2b marketing",
  "schedule linkedin posts",
  "linkedin scheduler",
  "linkedin post scheduler",
  "social media scheduling tools",
  "b2b social media marketing",
  "linkedin business to business marketing",
  "social media manager tool",
];

const faqs = [
  {
    question: "What is the best way to schedule LinkedIn posts?",
    answer:
      "The most reliable approach is to draft posts in batches, assign each to a fixed slot on a content calendar, and publish through an official API-connected scheduler like ShipOS. That keeps your linkedin posting schedule consistent without manual daily logins.",
  },
  {
    question: "Does ShipOS support LinkedIn personal profiles and company pages?",
    answer:
      "Yes. ShipOS connects LinkedIn accounts through Post For Me's official API so you can schedule text, image, and multi-image posts to connected personal or organization profiles from one queue.",
  },
  {
    question: "How does ShipOS help with LinkedIn B2B marketing?",
    answer:
      "ShipOS gives B2B teams a single workspace to plan thought-leadership posts, maintain a linkedin content strategy, batch content for the week, and track what shipped — without switching between spreadsheets and native LinkedIn.",
  },
  {
    question: "Can I use ShipOS for LinkedIn personal branding?",
    answer:
      "Yes. Founders, consultants, and creators use ShipOS to queue hooks, carousels, and story-driven posts on a predictable cadence — the foundation of sustainable linkedin personal branding.",
  },
  {
    question: "Is there a free trial for LinkedIn scheduling?",
    answer:
      "ShipOS offers a 7-day free trial on all paid plans.",
  },
  {
    question: "How does ShipOS compare to Buffer or Hootsuite for LinkedIn?",
    answer:
      "ShipOS includes LinkedIn scheduling alongside AI Content Studio, Slideshow Studio, bulk CSV scheduling, and multi-workspace support in one plan — without per-profile add-on fees. See our Buffer and Hootsuite comparison pages for a feature-by-feature breakdown.",
  },
];

const freeTools = [
  { label: "LinkedIn Hook Previewer", path: "/linkedin-hook-previewer" },
  { label: "LinkedIn Text Formatter", path: "/linkedin-text-formatter" },
  { label: "LinkedIn Engagement Calculator", path: "/linkedin-engagement-calculator" },
];

const useCases = [
  {
    icon: Briefcase,
    title: "B2B marketing teams",
    body: "Run linkedin b2b marketing campaigns with a shared calendar, batch approvals, and consistent posting across product launches and demand-gen cycles.",
  },
  {
    icon: Users,
    title: "Personal brands & founders",
    body: "Build linkedin personal branding with a fixed weekly rhythm — hooks, stories, and carousels queued in advance so you stay visible while building the product.",
  },
  {
    icon: Target,
    title: "Agencies & consultants",
    body: "Isolate each client in a workspace, schedule linkedin posts per brand, and keep b2b social media marketing operations out of shared spreadsheets.",
  },
];

const features = [
  {
    icon: CalendarDays,
    title: "Visual posting calendar",
    body: "Map your linkedin posting schedule across weeks. Drag, edit, and see gaps before they become missed publishing days.",
  },
  {
    icon: PenTool,
    title: "AI Content Studio",
    body: "Draft and refine post copy, hooks, and captions with AI assistance before you schedule linkedin posts.",
  },
  {
    icon: FileSpreadsheet,
    title: "Bulk scheduling",
    body: "Upload CSV or TSV batches when you need to load a full month of linkedin content strategy in one session.",
  },
  {
    icon: BarChart3,
    title: "Publishing analytics",
    body: "Track what went live, what failed, and how your linkedin marketing output compares week over week.",
  },
];

const algorithmTips = [
  {
    title: "Lead with a clear hook",
    body: "The linkedin algorithm tests early engagement on the first lines. Open with a specific outcome, tension, or number — not a generic greeting.",
  },
  {
    title: "Post on a fixed cadence",
    body: "Consistency beats sporadic bursts. A linkedin posting schedule of 3–5 quality posts per week outperforms random daily publishing for most B2B accounts.",
  },
  {
    title: "Mix formats intentionally",
    body: "Alternate text posts, document carousels, and image posts. A varied linkedin content strategy keeps your audience and the feed distribution system engaged.",
  },
  {
    title: "Reply in the first hour",
    body: "Scheduled publishing frees you to engage when posts go live. Comments in the first 60 minutes signal relevance to the linkedin algorithm.",
  },
];

export default function LinkedInPlatform() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="LinkedIn Scheduler & B2B Marketing Tool"
        description="Schedule LinkedIn posts, plan your B2B content strategy, and build personal branding on LinkedIn with ShipOS — calendar scheduling, bulk queue, AI studio, and analytics in one tool."
        path="/linkedin"
        type="website"
        keywords={LINKEDIN_KEYWORDS}
        jsonLd={[
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "LinkedIn", path: "/linkedin" },
          ]),
          faqSchema(faqs),
          howToSchema({
            name: "How to schedule LinkedIn posts with ShipOS",
            description:
              "Plan, draft, and schedule LinkedIn content for B2B marketing and personal branding using ShipOS.",
            path: "/linkedin",
            steps: [
              {
                name: "Connect your LinkedIn account",
                text: "Link your personal or company LinkedIn profile through ShipOS Connections.",
              },
              {
                name: "Draft and optimize post copy",
                text: "Write in Create Post or Content Studio. Use the LinkedIn Hook Previewer to refine your opening line.",
              },
              {
                name: "Assign calendar slots",
                text: "Pick dates and times on the visual calendar to build your linkedin posting schedule.",
              },
              {
                name: "Publish and engage",
                text: "ShipOS publishes via the official API. Engage with comments when posts go live to boost reach.",
              },
            ],
          }),
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-20">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 text-center mb-16">
          <SectionBadge
            label="Platform"
            text="LinkedIn marketing & scheduling"
            mobileText="LinkedIn scheduling"
          />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
            LinkedIn Scheduler for{" "}
            <span className="text-[#d75a34]">B2B Marketing</span> & Personal Branding
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            ShipOS is a social media manager tool built for linkedin marketing — schedule posts,
            plan your linkedin content strategy, and publish consistently without logging in every
            day. One dashboard for founders, B2B teams, and agencies.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/signup")}
              variant="marketing" className="h-12 px-8"
            >
              Start 7-Day Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="rounded-none h-12 px-8 font-bold"
              onClick={() => navigate("/linkedin-scheduler")}
            >
              See scheduling workflow
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground text-center mb-3">
            Everything you need for LinkedIn marketing
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            From linkedin posting schedule planning to bulk queue uploads — ShipOS covers the full
            social media scheduling workflow for professional networks.
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

        {/* Content strategy */}
        <section className="bg-white dark:bg-[#141413] border-y border-border py-16 mb-20">
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-4">
                Build a linkedin content strategy that ships
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Most linkedin b2b marketing fails from inconsistency, not bad ideas. ShipOS turns
                your strategy into a repeatable linkedin posting schedule: plan themes by week,
                batch drafts in Content Studio, and queue everything before Monday.
              </p>
              <ul className="space-y-3">
                {[
                  "Schedule linkedin posts weeks ahead on the visual calendar",
                  "Repurpose one idea across LinkedIn, X, and other channels",
                  "Bulk-upload content batches via CSV for campaign sprints",
                  "Track published vs. failed posts in one queue view",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 text-[#d75a34] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 rounded-none font-bold"
                onClick={() => navigate("/social-media-calendar-tool")}
              >
                Explore the calendar tool
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
                { day: "Tuesday", type: "Thought-leadership text post", time: "8:30 AM" },
                { day: "Wednesday", type: "Document carousel / PDF", time: "12:00 PM" },
                { day: "Thursday", type: "Case study or customer story", time: "9:00 AM" },
                { day: "Friday", type: "Personal branding / founder note", time: "8:00 AM" },
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

        {/* Algorithm / GEO */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground text-center mb-3">
            LinkedIn algorithm basics for schedulers
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            Scheduling does not bypass the linkedin algorithm — it gives you the consistency and
            bandwidth to publish content the algorithm can actually test. These principles apply
            whether you post manually or through ShipOS.
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

        {/* Use cases */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <h2 className="text-2xl font-black text-foreground mb-8 text-center">
            Who uses ShipOS for LinkedIn?
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

        {/* Free tools */}
        <section className="bg-white dark:bg-[#141413] border-y border-border py-14 mb-20">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-1.5 text-[#d75a34] mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest uppercase">Free tools</span>
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3">
              Free LinkedIn tools — no signup required
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8">
              Optimize hooks, formatting, and engagement benchmarks before you schedule linkedin
              posts in ShipOS.
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

        {/* Demo video */}
        <section className="py-16 bg-white dark:bg-[#141413] border-t border-b border-border/40 relative z-10 mb-20">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
            <div className="space-y-3">
              <SectionBadge label="Demo Video" text="LinkedIn scheduling walkthrough" />
              <h2 className="text-3xl font-black text-foreground tracking-tight">
                See the workflow in action
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Watch how founders and B2B teams draft, queue, and schedule LinkedIn posts from
                one ShipOS dashboard.
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

        {/* Pricing */}
        <section className="bg-[#FAF7F5] dark:bg-background border-t border-b border-border/40 py-20 relative z-10 mb-20">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-14">
              <SectionBadge label="Pricing" text="Simple pricing for all your needs" />
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                Plans and pricing
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg">
                LinkedIn scheduling is included on every plan — plus AI studio, bulk queue, and
                multi-platform publishing.
              </p>
            </div>


            <MarketingPricingCards />

          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 mb-20">
          <h2 className="text-2xl font-black text-foreground text-center mb-8">
            LinkedIn scheduling FAQs
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

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="rounded-none bg-white dark:bg-[#1c1917] border-x-2 border-b-2 border-t-[8px] border-x-black border-b-black border-t-[#d75a34] dark:border-x-neutral-800 dark:border-b-neutral-800 p-10 md:p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)] flex flex-col items-center relative overflow-hidden">
            {/* subtle grid texture */}
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* LinkedIn × ShipOS lockup */}
            <div className="relative flex items-center justify-center gap-3 sm:gap-5 mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0077B5] border-2 border-black dark:border-neutral-700 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,119,181,0.4)]">
                <Linkedin className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white" strokeWidth={0} />
              </div>
              <div className="flex flex-col items-center gap-0.5 px-1">
                <span className="text-[10px] font-black tracking-[0.25em] text-muted-foreground uppercase">
                  powered by
                </span>
                <span className="text-xl sm:text-2xl font-black text-foreground leading-none">×</span>
              </div>
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
              Start your{" "}
              <span className="text-[#0077B5]">LinkedIn</span> posting schedule today
            </h2>
            <p className="relative text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed mb-8">
              Join founders and B2B teams using ShipOS for LinkedIn marketing — schedule posts,
              manage workspaces, and publish across 9 platforms from one tool.
            </p>

            <div className="relative flex flex-wrap items-center justify-center gap-2 mb-10">
              {["Official API publishing", "B2B workspaces", "Bulk CSV queue"].map((pill) => (
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
              <Button
                onClick={() => navigate("/signup")}
                variant="marketing" className="h-12 px-8"
              >
                Start 7-Day Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="marketingOutline" className="h-12 px-8"
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
