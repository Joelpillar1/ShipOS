import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Clock3,
  MessageSquare,
  PenTool,
  Share2,
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

const CANONICAL_PATH = "/facebook-post-scheduler";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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

const FACEBOOK_KEYWORDS = [
  "facebook post scheduler",
  "schedule facebook posts",
  "how to schedule posts on facebook",
  "facebook scheduling tool",
  "facebook content calendar",
  "facebook page scheduler",
  "facebook marketing",
  "automate facebook posts",
  "facebook reels scheduler",
  "schedule facebook page posts",
  "facebook social media scheduler",
  "social media scheduling tools",
  "facebook business page scheduler",
  "fb post scheduler",
  "facebook planner",
  "social media post scheduler",
];

const faqs = [
  {
    question: "What is the best way to schedule Facebook posts?",
    answer:
      "Batch your captions and visuals, assign each to a fixed slot on a content calendar, and publish through an official API-connected scheduler like ShipOS. That keeps your facebook posting schedule consistent without manual daily logins.",
  },
  {
    question: "Does ShipOS support Facebook Pages and Reels?",
    answer:
      "Yes. ShipOS connects Facebook accounts through Post For Me's official API so you can schedule text, image, and video posts to connected Pages from one queue.",
  },
  {
    question: "How does ShipOS help with Facebook marketing?",
    answer:
      "ShipOS gives businesses and agencies a single workspace to maintain a facebook content calendar, batch captions in Content Studio, and publish on a predictable cadence — without switching between native Meta Business Suite and spreadsheets.",
  },
  {
    question: "How long should Facebook post captions be?",
    answer:
      "Facebook allows very long posts, but the feed truncates around 477 characters behind a 'See More' link. ShipOS helps you front-load hooks and key messages before you schedule facebook posts.",
  },
  {
    question: "Is there a free trial for Facebook scheduling?",
    answer:
      "ShipOS offers a 7-day free trial on all paid plans. A payment method is required at signup, but you won't be charged until the trial ends.",
  },
  {
    question: "How does ShipOS compare to Buffer or Hootsuite for Facebook?",
    answer:
      "ShipOS includes Facebook scheduling alongside AI Content Studio, bulk CSV scheduling, and multi-workspace support in one plan — without per-profile add-on fees. See our Buffer and Hootsuite comparison pages for a feature-by-feature breakdown.",
  },
];

const freeTools = [
  { label: "Facebook Engagement Calculator", path: "/facebook-engagement-calculator" },
  { label: "Social Post Limit Checker", path: "/social-post-limit-checker" },
  { label: "Instagram Carousel Splitter", path: "/instagram-carousel-splitter" },
];

const useCases = [
  {
    icon: Target,
    title: "Local businesses & SMBs",
    body: "Run facebook marketing with a fixed weekly rhythm — promotions, updates, and Reels queued in advance so your Page stays active while you run the business.",
  },
  {
    icon: Share2,
    title: "E-commerce & DTC brands",
    body: "Plan product launches, sales, and UGC campaigns on a facebook content calendar without juggling Meta Business Suite drafts.",
  },
  {
    icon: Users,
    title: "Agencies & social teams",
    body: "Isolate each client in a workspace, schedule facebook posts per Page, and keep approvals and publishing in one queue.",
  },
];

const features = [
  {
    icon: CalendarDays,
    title: "Visual posting calendar",
    body: "Map your facebook posting schedule across weeks. Drag, edit, and spot gaps before they become missed publishing days.",
  },
  {
    icon: PenTool,
    title: "AI caption studio",
    body: "Draft and refine Page post copy with AI assistance — optimized for feed truncation and engagement before you schedule.",
  },
  {
    icon: MessageSquare,
    title: "Multi-format publishing",
    body: "Schedule text, image, and video posts to Facebook Pages from the same dashboard you use for Instagram and other channels.",
  },
  {
    icon: BarChart3,
    title: "Publishing analytics",
    body: "Track what went live, what failed, and how your facebook scheduling output compares week over week.",
  },
];

const algorithmTips = [
  {
    title: "Hook before 'See More'",
    body: "Facebook truncates long posts in the feed at roughly 477 characters. Lead with your strongest line so users tap through before the cutoff.",
  },
  {
    title: "Lean into Reels and video",
    body: "Facebook's feed distribution favors short-form video and Reels. Mix video posts into your schedule — not just link shares and static images.",
  },
  {
    title: "Post on a fixed cadence",
    body: "Consistency helps Pages stay visible despite organic reach limits. A facebook posting schedule of 3–5 quality posts per week beats sporadic publishing.",
  },
  {
    title: "Reply in the first hour",
    body: "Scheduled publishing frees you to engage when posts go live. Comments and nested replies in the first 60 minutes signal active conversation to the feed algorithm.",
  },
];

export default function FacebookPlatform() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Facebook Post Scheduler & Page Content Calendar"
        description="Schedule Facebook Page posts, plan your content calendar, and grow reach with ShipOS — post scheduling, Reels workflow, AI captions, and multi-platform publishing in one tool."
        path={CANONICAL_PATH}
        type="website"
        keywords={FACEBOOK_KEYWORDS}
        jsonLd={[
          webPageSchema({
            name: "Facebook Post Scheduler & Page Content Calendar",
            description:
              "Schedule Facebook Page posts, plan your content calendar, and grow reach with ShipOS.",
            path: CANONICAL_PATH,
            about: "Facebook Page post scheduling",
            keywords: FACEBOOK_KEYWORDS,
          }),
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Facebook", path: CANONICAL_PATH },
          ]),
          faqSchema(faqs),
          howToSchema({
            name: "How to schedule Facebook posts with ShipOS",
            description:
              "Plan, draft, and schedule Facebook Page content for consistent publishing using ShipOS.",
            path: CANONICAL_PATH,
            steps: [
              {
                name: "Connect your Facebook Page",
                text: "Link your Facebook Page through ShipOS Connections.",
              },
              {
                name: "Draft posts and captions",
                text: "Write in Create Post or Content Studio. Front-load hooks before the feed truncation point.",
              },
              {
                name: "Assign calendar slots",
                text: "Pick dates and times on the visual calendar to build your facebook posting schedule.",
              },
              {
                name: "Publish and engage",
                text: "ShipOS publishes via the official API. Reply to comments when posts go live to boost reach.",
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
            text="Facebook scheduling & Page planning"
            mobileText="Facebook scheduling"
          />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
            Facebook Post Scheduler for{" "}
            <span className="text-[#d75a34]">Page Growth</span> & Consistency
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A <strong className="font-semibold text-foreground">facebook post scheduler</strong> lets
            you plan Page posts and Reels on a content calendar — the reliable answer to how to
            schedule posts on facebook without daily Meta Business Suite logins. ShipOS is a facebook
            scheduling tool for businesses and agencies from one dashboard.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => navigate("/signup")} variant="marketing" className="h-12 px-8">
              Start 7-Day Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="rounded-none h-12 px-8 font-bold"
              onClick={() => navigate("/facebook-engagement-calculator")}
            >
              Audit Page engagement
            </Button>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-20">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground text-center mb-3">
            Everything you need for Facebook scheduling
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            From facebook content calendar planning to bulk queue uploads — ShipOS covers the full
            schedule facebook posts workflow for Pages and brands.
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
                Build a facebook content calendar that ships
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Most facebook marketing fails from inconsistency, not bad creative. ShipOS turns your
                strategy into a repeatable posting schedule: plan themes by week, batch captions in
                Content Studio, and queue everything before Monday.
              </p>
              <ul className="space-y-3">
                {[
                  "Schedule facebook posts weeks ahead on the visual calendar",
                  "Repurpose one idea across Facebook, Instagram, and other channels",
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
                { day: "Monday", type: "Educational tip + image", time: "10:00 AM" },
                { day: "Wednesday", type: "Product promo Reel", time: "6:00 PM" },
                { day: "Thursday", type: "Customer story / UGC", time: "12:30 PM" },
                { day: "Saturday", type: "Weekend offer post", time: "9:00 AM" },
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
            Facebook feed basics for schedulers
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            Scheduling does not bypass Facebook organic reach limits — it gives you the consistency
            and bandwidth to publish content the algorithm can actually test. These principles apply
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

        <section className="max-w-6xl mx-auto px-6 mb-20">
          <h2 className="text-2xl font-black text-foreground mb-8 text-center">
            Who uses ShipOS for Facebook?
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
              Free Facebook tools — no signup required
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8">
              Benchmark engagement, check caption limits, and prep visual assets before you schedule
              facebook posts in ShipOS.
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
              <SectionBadge label="Demo Video" text="Facebook scheduling walkthrough" />
              <h2 className="text-3xl font-black text-foreground tracking-tight">
                See the workflow in action
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Watch how businesses and agencies draft, queue, and schedule Facebook posts from one
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
          description="Facebook scheduling is included on every plan — plus AI studio, bulk queue, and multi-platform publishing."
          onCtaClick={() => navigate("/signup")}
        />

        <section className="max-w-3xl mx-auto px-6 mb-20">
          <h2 className="text-2xl font-black text-foreground text-center mb-8">
            Facebook scheduling FAQs
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
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#1877F2] border-2 border-black dark:border-neutral-700 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(24,119,242,0.4)]">
                <FacebookIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
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
              Start your <span className="text-[#1877F2]">Facebook</span> posting schedule today
            </h2>
            <p className="relative text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed mb-8">
              Join businesses and agencies using ShipOS for facebook marketing — schedule Page posts,
              manage workspaces, and publish across 9 platforms from one tool.
            </p>

            <div className="relative flex flex-wrap items-center justify-center gap-2 mb-10">
              {["Official API publishing", "Page scheduling", "Bulk CSV queue"].map((pill) => (
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
