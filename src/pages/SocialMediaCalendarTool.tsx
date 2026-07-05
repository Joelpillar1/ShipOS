import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Check, ClipboardList, Clock3, Columns3, Workflow } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MarketingPricingCards } from "@/components/MarketingPricingCards";
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

const calendarFields = [
  "Platform",
  "Post format",
  "Owner",
  "Draft copy",
  "Media asset",
  "Campaign / pillar tag",
  "Publish date and time",
  "Status (draft, review, approved, scheduled, published)",
  "CTA / destination link",
  "UTM or tracking link",
];

const statusPipeline = [
  "Idea",
  "Briefed",
  "In production",
  "Draft",
  "Review",
  "Approved",
  "Scheduled",
  "Published",
  "Reported",
];

const weeklyCadence = [
  { day: "Monday", focus: "Planning", detail: "Map the week and assign owners." },
  { day: "Tuesday", focus: "Creation", detail: "Write copy and attach creative assets." },
  { day: "Wednesday", focus: "Review", detail: "Run approvals and fix feedback." },
  { day: "Thursday", focus: "Scheduling", detail: "Queue approved posts and QA links." },
  { day: "Friday", focus: "Analysis", detail: "Review outcomes and refresh next week." },
];

const faqs = [
  {
    question: "What is a social media calendar tool?",
    answer:
      "A social media calendar tool is a planning and operations system for what will be published, where, when, and by whom. It is broader than only scheduling because it also tracks workflow and approvals.",
  },
  {
    question: "How is a calendar tool different from a scheduler?",
    answer:
      "A scheduler is the execution layer that publishes at specific times. A calendar tool includes planning, ownership, status, and campaign organization around the publishing step.",
  },
  {
    question: "Do small teams need this level of process?",
    answer:
      "Small teams can start simple, but even basic fields (owner, status, date, platform) reduce missed posts and duplicate work. The process can scale as content volume increases.",
  },
  {
    question: "Can this be used for agency workflows?",
    answer:
      "Yes. Workspaces and explicit status stages help agencies keep client calendars separated and approval timelines visible.",
  },
];

export default function SocialMediaCalendarTool() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Social Media Calendar Tool | ShipOS"
        description="Plan social campaigns with a detailed calendar workflow: ownership, statuses, approvals, scheduling, and analysis in one operational system."
        path="/social-media-calendar-tool"
        type="website"
        keywords={[
          "social media calendar tool",
          "content calendar software",
          "social media planning workflow",
          "social media approval workflow",
          "social media scheduler calendar",
        ]}
        jsonLd={[
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Social Media Calendar Tool", path: "/social-media-calendar-tool" },
          ]),
          faqSchema(faqs),
          howToSchema({
            name: "How to run a social media calendar workflow",
            description:
              "Set fields, define statuses, plan weekly cadence, and schedule approved content.",
            path: "/social-media-calendar-tool",
            steps: [
              {
                name: "Define required fields",
                text: "Set platform, owner, status, publish time, and campaign fields for every row.",
              },
              {
                name: "Run review pipeline",
                text: "Move posts through draft, review, approved, and scheduled statuses.",
              },
              {
                name: "Publish and measure",
                text: "Schedule approved posts and use outcomes to improve next week.",
              },
            ],
          }),
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-16">
        <section className="max-w-6xl mx-auto px-6 text-center mb-14">
          <SectionBadge label="Commercial Page" text="Social media calendar tool" mobileText="Calendar tool" />
          <h1 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            Social Media Calendar Tool: Detailed Workflow Guide
          </h1>
          <p className="mt-5 text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            This page focuses on calendar operations: what to schedule, how to structure approvals,
            which fields to track, and how to keep weekly publishing consistent without process chaos.
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
            <Columns3 className="w-5 h-5 text-[#d75a34]" />
            <h2 className="text-lg font-bold">Planning visibility</h2>
            <p className="text-sm text-muted-foreground">
              See weekly and monthly publishing coverage in one place to spot gaps early.
            </p>
          </div>
          <div className="border border-border bg-card p-6 space-y-3">
            <Workflow className="w-5 h-5 text-[#d75a34]" />
            <h2 className="text-lg font-bold">Approval workflow control</h2>
            <p className="text-sm text-muted-foreground">
              Keep posts moving through clear status stages instead of scattered chat approvals.
            </p>
          </div>
          <div className="border border-border bg-card p-6 space-y-3">
            <CalendarDays className="w-5 h-5 text-[#d75a34]" />
            <h2 className="text-lg font-bold">Execution consistency</h2>
            <p className="text-sm text-muted-foreground">
              Convert approved plans into scheduled publishing with fewer missed slots.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Calendar tool vs scheduler</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border bg-card p-5">
              <h3 className="text-base font-bold text-foreground">Scheduler (execution layer)</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                A scheduler is mainly for publish timing: queue post, set date/time, and send.
              </p>
            </div>
            <div className="border border-border bg-card p-5">
              <h3 className="text-base font-bold text-foreground">Calendar tool (operations layer)</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                A calendar tool includes planning, ownership, status, approvals, campaign tagging,
                and analysis around scheduling.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Required calendar fields</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {calendarFields.map((field) => (
              <div key={field} className="border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground">
                {field}
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Recommended status pipeline</h2>
          <div className="grid sm:grid-cols-3 md:grid-cols-3 gap-3">
            {statusPipeline.map((item) => (
              <div key={item} className="border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Weekly operating cadence</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {weeklyCadence.map((step) => (
              <div key={step.day} className="border border-border bg-card p-4">
                <p className="text-xs font-bold tracking-widest text-[#d75a34] uppercase">{step.day}</p>
                <h3 className="mt-2 text-base font-bold text-foreground">{step.focus}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-[#141413] border-t border-b border-border/40 relative z-10 mb-16">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
            <div className="space-y-3">
              <SectionBadge label="Demo Video" text="Calendar workflow walkthrough" />
              <h2 className="text-3xl font-black text-foreground tracking-tight">See calendar operations in action</h2>
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

        <section className="bg-[#FAF7F5] dark:bg-background border-t border-b border-border/40 py-20 relative z-10 mb-16">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-14">
              <SectionBadge label="Pricing" text="Simple pricing for all your needs" />
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">Plans and pricing</h2>
            </div>


            <MarketingPricingCards />

          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Information boundaries (no overclaims)</h2>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#d75a34] font-bold">-</span>
              <span>This page describes social calendar process design and scheduling operations.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#d75a34] font-bold">-</span>
              <span>It does not claim guaranteed reach, guaranteed conversions, or guaranteed follower growth.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#d75a34] font-bold">-</span>
              <span>Results depend on content quality, channel fit, audience behavior, and consistent execution.</span>
            </li>
          </ul>
        </section>

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

        <section className="max-w-6xl mx-auto px-6">
          <h2 className="text-xl font-black text-foreground mb-4">Related pages</h2>
          <div className="grid sm:grid-cols-4 gap-4 text-sm">
            <Link to="/" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              ShipOS homepage overview
            </Link>
            <Link to="/ai-social-media-scheduler" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              AI social media scheduler
            </Link>
            <Link to="/linkedin-scheduler" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              LinkedIn scheduler
            </Link>
            <Link to="/pricing" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              Social media scheduler pricing
            </Link>
          </div>
          <div className="mt-5 text-xs text-muted-foreground font-medium flex items-start gap-2">
            <ClipboardList className="w-3.5 h-3.5 mt-0.5" />
            <p>
              Research note: this page structure reflects common guidance in social calendar
              documentation from major platforms (calendar views, required fields, ownership,
              approval stages, and scheduling cadence).
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
