import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, CheckCircle2, Clock3, FileSpreadsheet, Linkedin, MessageSquare } from "lucide-react";
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

const faqs = [
  {
    question: "Can I schedule LinkedIn posts in advance?",
    answer:
      "Yes. ShipOS lets you plan and schedule LinkedIn posts ahead of time in a calendar workflow so publishing is consistent across weekdays and campaigns.",
  },
  {
    question: "Can I optimize post copy before scheduling?",
    answer:
      "Yes. You can use ShipOS writing and utility flows to refine hooks, spacing, and post structure before scheduling.",
  },
  {
    question: "Can I bulk schedule LinkedIn content?",
    answer:
      "Yes. You can use the bulk scheduling flow with CSV, TSV, or text input when preparing larger content batches.",
  },
  {
    question: "Is this only for LinkedIn?",
    answer:
      "No. This page focuses on LinkedIn use cases, but ShipOS also supports multi-platform scheduling from the same workspace.",
  },
];

export default function LinkedinScheduler() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="LinkedIn Scheduler | ShipOS"
        description="Schedule LinkedIn posts with a clear weekly workflow. Draft, optimize, batch, and publish with ShipOS from one dashboard."
        path="/linkedin-scheduler"
        type="website"
        keywords={[
          "linkedin scheduler",
          "schedule linkedin posts",
          "linkedin post scheduler",
          "linkedin content calendar",
          "linkedin scheduling tool",
        ]}
        jsonLd={[
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "LinkedIn Scheduler", path: "/linkedin-scheduler" },
          ]),
          faqSchema(faqs),
          howToSchema({
            name: "How to schedule LinkedIn posts",
            description: "Plan, prepare, and schedule LinkedIn content with ShipOS.",
            path: "/linkedin-scheduler",
            steps: [
              {
                name: "Draft the post",
                text: "Write and refine the post text with clear hook and structure.",
              },
              {
                name: "Pick date and queue",
                text: "Choose publish times in the calendar and queue posts for the week.",
              },
              {
                name: "Review and iterate",
                text: "Track output and refine future posts based on workflow outcomes.",
              },
            ],
          }),
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-16">
        <section className="max-w-6xl mx-auto px-6 text-center mb-14">
          <SectionBadge label="Commercial Page" text="LinkedIn scheduler" mobileText="LinkedIn scheduling" />
          <h1 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            LinkedIn Scheduler: Practical Scheduling Workflow
          </h1>
          <p className="mt-5 text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            This page explains how to schedule LinkedIn content with clear operational steps:
            planning cadence, drafting posts, batching weekly queues, and publishing consistently.
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
            <Linkedin className="w-5 h-5 text-[#d75a34]" />
            <h2 className="text-lg font-bold">LinkedIn-first publishing flow</h2>
            <p className="text-sm text-muted-foreground">
              Create a repeatable workflow specifically for LinkedIn post frequency and cadence.
            </p>
          </div>
          <div className="border border-border bg-card p-6 space-y-3">
            <Clock3 className="w-5 h-5 text-[#d75a34]" />
            <h2 className="text-lg font-bold">Weekly calendar planning</h2>
            <p className="text-sm text-muted-foreground">
              Organize content across weekdays so posting is consistent instead of ad hoc.
            </p>
          </div>
          <div className="border border-border bg-card p-6 space-y-3">
            <FileSpreadsheet className="w-5 h-5 text-[#d75a34]" />
            <h2 className="text-lg font-bold">Batch queue support</h2>
            <p className="text-sm text-muted-foreground">
              Prepare larger post batches with bulk scheduling when needed.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Operational steps (detailed)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border bg-card p-5">
              <p className="text-xs font-bold tracking-wider text-[#d75a34] uppercase">Step 1: Planning cadence</p>
              <h3 className="mt-2 text-base font-bold text-foreground">Set a fixed weekly LinkedIn rhythm</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Decide publishing days and times first (for example 3-5 posts per week), then map every slot in the calendar.
                This removes ad hoc posting and creates predictable output.
              </p>
            </div>
            <div className="border border-border bg-card p-5">
              <p className="text-xs font-bold tracking-wider text-[#d75a34] uppercase">Step 2: Drafting posts</p>
              <h3 className="mt-2 text-base font-bold text-foreground">Prepare hook, body, and CTA structure</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Draft all posts for the week in one writing block. For each post, define the opening hook, core value, and final CTA
                before moving to scheduling.
              </p>
            </div>
            <div className="border border-border bg-card p-5">
              <p className="text-xs font-bold tracking-wider text-[#d75a34] uppercase">Step 3: Batch queue build</p>
              <h3 className="mt-2 text-base font-bold text-foreground">Load multiple posts into the queue</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Queue approved posts in one session instead of one-by-one daily posting. For larger cycles, use bulk scheduling input
                (CSV, TSV, or text) to speed up operations.
              </p>
            </div>
            <div className="border border-border bg-card p-5">
              <p className="text-xs font-bold tracking-wider text-[#d75a34] uppercase">Step 4: Publish and refine</p>
              <h3 className="mt-2 text-base font-bold text-foreground">Track output and improve next batch</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                After publishing, review what performed well, then update next week’s hooks and content mix.
                Keep the same cadence, improve the message quality each cycle.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">What this page is focused on</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border bg-card p-5">
              <h3 className="text-base font-bold text-foreground">LinkedIn publishing consistency</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                The main objective is maintaining a steady posting rhythm rather than manually posting when time is available.
              </p>
            </div>
            <div className="border border-border bg-card p-5">
              <h3 className="text-base font-bold text-foreground">Hook and structure quality</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                You can combine this scheduler flow with LinkedIn formatting and preview tools before queueing posts.
              </p>
            </div>
            <div className="border border-border bg-card p-5">
              <h3 className="text-base font-bold text-foreground">Team and client operations</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Workspaces help keep multiple brands organized when running agency or team workflows.
              </p>
            </div>
            <div className="border border-border bg-card p-5">
              <h3 className="text-base font-bold text-foreground">Multi-platform fallback</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Even if LinkedIn is your primary channel, the same queue can be adapted for broader channel distribution.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-[#141413] border-t border-b border-border/40 relative z-10 mb-16">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
            <div className="space-y-3">
              <SectionBadge label="Demo Video" text="LinkedIn scheduling walkthrough" />
              <h2 className="text-3xl font-black text-foreground tracking-tight">See the workflow in action</h2>
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

        <FreeToolPricingSection variant="platform" className="mb-16" onCtaClick={() => navigate("/signup")} />

        <section className="max-w-4xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-4">Information boundaries (no overclaims)</h2>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#d75a34] font-bold">-</span>
              <span>This page explains product workflow and scheduling capabilities for LinkedIn use cases.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#d75a34] font-bold">-</span>
              <span>It does not claim guaranteed impressions, algorithm boosts, or guaranteed follower growth.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#d75a34] font-bold">-</span>
              <span>Performance depends on topic quality, audience fit, consistency, and iteration quality.</span>
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

        <section className="max-w-4xl mx-auto px-6">
          <h2 className="text-xl font-black text-foreground mb-4">Related pages</h2>
          <div className="grid sm:grid-cols-4 gap-4 text-sm">
            <Link to="/" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              ShipOS homepage overview
            </Link>
            <Link to="/ai-social-media-scheduler" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              AI social media scheduler
            </Link>
            <Link to="/linkedin-hook-previewer" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              LinkedIn hook previewer
            </Link>
            <Link to="/pricing" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              Social media scheduler pricing
            </Link>
          </div>
          <p className="mt-5 text-xs text-muted-foreground font-medium flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Use this page as the LinkedIn-focused entry point; use the AI scheduler page for multi-platform planning.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
