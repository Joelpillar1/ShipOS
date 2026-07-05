import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Clock3,
  Image,
  LayoutGrid,
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

const CANONICAL_PATH = "/pinterest-pin-scheduler";

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.12.115.226.085.345-.093.389-.301 1.224-.341 1.391-.054.221-.179.268-.413.16-1.545-.719-2.51-2.977-2.51-4.793 0-3.902 2.836-7.487 8.174-7.487 4.293 0 7.629 3.059 7.629 7.148 0 4.265-2.689 7.697-6.422 7.697-1.254 0-2.435-.651-2.839-1.42l-.772 2.94c-.28 1.066-1.037 2.403-1.542 3.226C8.854 23.834 10.373 24 12 24c6.63 0 12-5.373 12-12S18.63 0 12 0z" />
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

const PINTEREST_KEYWORDS = [
  "pinterest post scheduler",
  "schedule pinterest pins",
  "pinterest scheduling tool",
  "pinterest content calendar",
  "pinterest pin scheduler",
  "pinterest marketing",
  "automate pinterest posts",
  "pinterest growth",
  "pinterest seo",
  "pin scheduler",
  "schedule pins",
  "pinterest planner",
  "social media scheduling tools",
  "pinterest for business",
  "pinterest traffic",
];

const faqs = [
  {
    question: "What is the best way to schedule Pinterest pins?",
    answer:
      "Batch your pin images, titles, and keyword-rich descriptions, assign each to a board and calendar slot, and publish through an official API-connected scheduler like ShipOS. That keeps your pinterest posting schedule consistent without manual daily logins.",
  },
  {
    question: "Does ShipOS support Pinterest boards and destination links?",
    answer:
      "Yes. ShipOS connects Pinterest accounts through the official API so you can schedule image pins with titles, descriptions, board assignment, and destination URLs from one queue.",
  },
  {
    question: "How does ShipOS help with Pinterest marketing?",
    answer:
      "ShipOS gives e-commerce brands and bloggers a single workspace to maintain a pinterest content calendar, batch SEO-friendly pin copy in Content Studio, and publish on a predictable cadence that drives long-term search traffic.",
  },
  {
    question: "What are Pinterest pin description limits?",
    answer:
      "Pin descriptions support up to 500 characters and board names up to 50 characters. ShipOS validates copy before publish so your pins ship with complete, keyword-optimized descriptions.",
  },
  {
    question: "Is there a free trial for Pinterest scheduling?",
    answer:
      "ShipOS offers a 7-day free trial on all paid plans. A payment method is required at signup, but you won't be charged until the trial ends.",
  },
  {
    question: "How does ShipOS compare to Later for Pinterest?",
    answer:
      "ShipOS includes Pinterest scheduling alongside multi-workspace support, bulk CSV queue, and 9-platform publishing in one plan — without Later's per-Social-Set account limits. See our Later comparison page for a full breakdown.",
  },
];

const freeTools = [
  { label: "Social Post Limit Checker", path: "/social-post-limit-checker" },
  { label: "Instagram Grid Maker", path: "/instagram-grid-maker" },
  { label: "Instagram Carousel Splitter", path: "/instagram-carousel-splitter" },
];

const useCases = [
  {
    icon: Target,
    title: "E-commerce & DTC brands",
    body: "Drive product discovery and site traffic with a fixed weekly pin cadence — product shots, lifestyle images, and blog links queued to the right boards.",
  },
  {
    icon: Image,
    title: "Bloggers & publishers",
    body: "Repurpose blog posts into pin graphics on a pinterest content calendar without manually uploading each pin in the native app.",
  },
  {
    icon: Users,
    title: "Agencies & visual marketers",
    body: "Isolate each client in a workspace, schedule pins per brand and board, and keep visual content approvals in one queue.",
  },
];

const features = [
  {
    icon: CalendarDays,
    title: "Visual posting calendar",
    body: "Map your pinterest posting schedule across weeks. Drag, edit, and spot gaps before they become missed publishing days.",
  },
  {
    icon: PenTool,
    title: "AI copy studio",
    body: "Draft pin titles and keyword-rich descriptions with AI assistance before you schedule pinterest pins.",
  },
  {
    icon: LayoutGrid,
    title: "Board assignment",
    body: "Select the right Pinterest board for each pin at schedule time — keep seasonal, product, and blog boards organized.",
  },
  {
    icon: BarChart3,
    title: "Publishing analytics",
    body: "Track what went live, what failed, and how your pinterest scheduling output compares week over week.",
  },
];

const algorithmTips = [
  {
    title: "Design for vertical 2:3 pins",
    body: "Pinterest favors tall pin graphics (1000×1500 px is a common standard). Vertical images occupy more feed space and earn more saves than square crops.",
  },
  {
    title: "Write descriptions like SEO copy",
    body: "Pin descriptions support 500 characters. Front-load keywords naturally — Pinterest acts as a visual search engine, and descriptive copy helps pins surface months later.",
  },
  {
    title: "Pin on a fixed cadence",
    body: "Consistency compounds on Pinterest. A steady schedule of 5–15 pins per week keeps boards active and signals fresh content to distribution.",
  },
  {
    title: "Always include a destination link",
    body: "Pins with clear outbound links drive site traffic. Schedule pins with blog posts, product pages, or lead magnets attached — not just pretty images.",
  },
];

export default function PinterestPlatform() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Pinterest Pin Scheduler & Content Calendar"
        description="Schedule Pinterest pins, plan your content calendar, and drive traffic with ShipOS — pin scheduling, board assignment, SEO descriptions, and multi-platform publishing in one tool."
        path={CANONICAL_PATH}
        type="website"
        keywords={PINTEREST_KEYWORDS}
        jsonLd={[
          webPageSchema({
            name: "Pinterest Pin Scheduler & Content Calendar",
            description:
              "Schedule Pinterest pins, plan your content calendar, and drive traffic with ShipOS.",
            path: CANONICAL_PATH,
            about: "Pinterest pin scheduling",
            keywords: PINTEREST_KEYWORDS,
          }),
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Pinterest", path: CANONICAL_PATH },
          ]),
          faqSchema(faqs),
          howToSchema({
            name: "How to schedule Pinterest pins with ShipOS",
            description:
              "Plan, draft, and schedule Pinterest pins for consistent traffic and growth using ShipOS.",
            path: CANONICAL_PATH,
            steps: [
              {
                name: "Connect your Pinterest account",
                text: "Link your Pinterest business profile through ShipOS Connections.",
              },
              {
                name: "Prep pin creative and copy",
                text: "Upload vertical pin images. Write keyword-rich titles and descriptions in Content Studio.",
              },
              {
                name: "Assign boards and calendar slots",
                text: "Pick boards and publish times on the visual calendar to build your pinterest posting schedule.",
              },
              {
                name: "Publish and monitor traffic",
                text: "ShipOS publishes via the official API. Track what shipped and iterate on top-performing pin formats.",
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
            text="Pinterest scheduling & pin planning"
            mobileText="Pinterest scheduling"
          />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
            Pinterest Pin Scheduler for{" "}
            <span className="text-[#d75a34]">Traffic</span> & Visual SEO
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A <strong className="font-semibold text-foreground">pinterest pin scheduler</strong> queues
            vertical pins with SEO-rich descriptions on a content calendar. ShipOS is a pinterest
            scheduling tool for brands and creators — schedule pins, assign boards, and drive
            long-tail traffic from one dashboard for e-commerce, bloggers, and agencies.
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
            Everything you need for Pinterest scheduling
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            From pinterest content calendar planning to board-level organization — ShipOS covers the
            full schedule pinterest pins workflow for visual search traffic.
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
                Build a pinterest content calendar that ships
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Most pinterest marketing fails from inconsistency, not bad creative. ShipOS turns
                your strategy into a repeatable pinning schedule: plan themes by week, batch
                descriptions in Content Studio, and queue everything before Monday.
              </p>
              <ul className="space-y-3">
                {[
                  "Schedule pinterest pins weeks ahead on the visual calendar",
                  "Assign pins to the right boards at publish time",
                  "Bulk-upload content batches via CSV for campaign sprints",
                  "Validate 500-character descriptions before anything goes live",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 text-[#d75a34] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 rounded-none font-bold"
                onClick={() => navigate("/instagram-grid-maker")}
              >
                Plan visual layouts
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
                { day: "Monday", type: "Blog post pin (3 variants)", time: "9:00 AM" },
                { day: "Wednesday", type: "Product lifestyle pin", time: "12:00 PM" },
                { day: "Friday", type: "Seasonal board refresh", time: "7:00 PM" },
                { day: "Sunday", type: "Inspirational quote graphic", time: "10:30 AM" },
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
            Pinterest distribution basics for schedulers
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            Pinterest rewards fresh pins and searchable descriptions over time — not one-off viral
            moments. These principles apply whether you pin manually or through ShipOS.
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
            Who uses ShipOS for Pinterest?
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
              Free tools for pin creative — no signup required
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8">
              Check caption limits and prep visual assets before you schedule pinterest pins in
              ShipOS.
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
              <SectionBadge label="Demo Video" text="Pinterest scheduling walkthrough" />
              <h2 className="text-3xl font-black text-foreground tracking-tight">
                See the workflow in action
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Watch how brands and creators draft, queue, and schedule Pinterest pins from one
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
          description="Pinterest scheduling is included on every plan — plus AI copy, board assignment, bulk queue, and multi-platform publishing."
          onCtaClick={() => navigate("/signup")}
        />

        <section className="max-w-3xl mx-auto px-6 mb-20">
          <h2 className="text-2xl font-black text-foreground text-center mb-8">
            Pinterest scheduling FAQs
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
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#E60023] border-2 border-black dark:border-neutral-700 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(230,0,35,0.4)]">
                <PinterestIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
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
              Start your <span className="text-[#E60023]">Pinterest</span> pinning schedule today
            </h2>
            <p className="relative text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed mb-8">
              Join brands and creators using ShipOS for pinterest marketing — schedule pins, assign
              boards, and publish across 9 platforms from one tool.
            </p>

            <div className="relative flex flex-wrap items-center justify-center gap-2 mb-10">
              {["Official API publishing", "Board assignment", "Bulk CSV queue"].map((pill) => (
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
