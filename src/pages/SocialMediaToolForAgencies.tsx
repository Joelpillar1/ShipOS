import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Info,
  Layers,
  Menu,
  Play,
  Scale,
  Users,
} from "lucide-react";
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

const faqs = [
  {
    question: "How does ShipOS keep client social tokens separate?",
    answer:
      "ShipOS isolates each client within a dedicated Workspace. This means API access tokens, connected profiles, posting queues, drafts, and media libraries are partitioned at the database level. Members invited to Workspace A cannot view or publish to channels connected to Workspace B, preventing cross-client publishing errors.",
  },
  {
    question: "Does ShipOS replace client approval portals?",
    answer:
      "No. ShipOS provides the workspace, draft queue, and calendar scheduling layers. It does not include client-facing automated approval portals where clients can approve posts without logging in. For client approvals, agencies typically share their screen, export the calendar draft, or add clients as restricted workspace members.",
  },
  {
    question: "What are the API and rate limit boundaries for agencies?",
    answer:
      "Every social platform enforces rate limits on posting frequency and API calls. For example, LinkedIn restricts excessive daily posts on personal profiles to prevent spam. ShipOS complies with official API limits. If your agency is managing high-volume client accounts, we recommend scheduling posts with at least 15-minute intervals.",
  },
  {
    question: "Is there an auto-approve or SLA policy built in?",
    answer:
      "No. Operational rules like feedback SLAs (e.g., 'approvals required 48 hours before publishing') must be managed via your contracts and client agreements. ShipOS is the scheduling and execution system to host those approved assets.",
  },
];

const menuItems = [
  { id: "operational-bottlenecks", label: "1. Agency Bottlenecks" },
  { id: "workspace-architecture", label: "2. Workspace Isolation" },
  { id: "weekly-cadence", label: "3. Weekly Cadence" },
  { id: "csv-schema", label: "4. CSV Batch Schema" },
  { id: "api-constraints", label: "5. API & Platform Limits" },
  { id: "demo-walkthrough", label: "6. Video Walkthrough" },
  { id: "pricing-plans", label: "7. Plans & Pricing" },
  { id: "operational-faqs", label: "8. Operational FAQs" },
];

export default function SocialMediaToolForAgencies() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [activeSection, setActiveSection] = useState("operational-bottlenecks");

  // Track active section on scroll for the Left Sidebar TOC
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const item of menuItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background text-foreground">
      <SEO
        title="Social Media Management for Agencies — Guide & Workflow"
        description="A highly detailed operational guide for agency social media scheduling. Learn workspace isolation, weekly content batching, exact CSV schemas, and API constraints."
        path="/social-media-tool-for-agencies"
        type="website"
        keywords={[
          "agency social media workflow",
          "social media tool for agencies",
          "client workspace scheduling",
          "multi brand social manager",
          "content calendar approval process",
        ]}
        jsonLd={[
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Social Media Tool for Agencies", path: "/social-media-tool-for-agencies" },
          ]),
          faqSchema(faqs),
          howToSchema({
            name: "How to operate an agency social media scheduling queue",
            description: "Setup workspace isolation, configure batch imports, schedule content, and respect platform API limits.",
            path: "/social-media-tool-for-agencies",
            steps: [
              { name: "Isolate client tokens", text: "Create separate workspaces for each brand to prevent cross-client posting errors." },
              { name: "Batch weekly production", text: "Write and schedule posts in a single weekly block rather than posting daily on the fly." },
              { name: "Validate formats", text: "Check character limits and media dimensions against platform requirements." },
            ],
          }),
        ]}
      />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-8 max-w-7xl mx-auto text-center border-b border-border/60">
        <div className="max-w-4xl mx-auto space-y-4">
          <SectionBadge label="Agency Operations" text="Centralized Client Management Guide" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-foreground">
            The Operational Guide to Agency Social Media Scheduling
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            A comprehensive, factual breakdown of social media operations for agencies. Learn how to structure client separation, execute weekly batch scheduling, format import spreadsheets, and handle API boundaries.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              onClick={() => navigate("/signup")}
              variant="marketing"
            >
              Start Free 7-Day Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="marketingOutline" onClick={() => scrollTo("pricing-plans")}>
              View Flat Plans
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Sidebar Table of Contents (Desktop only) */}
        <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 h-fit border-r border-border/60 pr-6 space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Menu className="w-3.5 h-3.5" /> Guide Sections
            </p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={cn(
                  "w-full text-left py-2 px-3 text-xs font-bold rounded-none transition-colors border-l-2",
                  activeSection === item.id
                    ? "border-[#d75a34] text-[#d75a34] bg-[#d75a34]/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="bg-[#fbf4f2] dark:bg-[#1a1310] border border-[#d75a34]/20 p-4 space-y-2.5">
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Key Takeaway</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              The most stable agencies run on flat subscription pricing models rather than per-profile scaling models which penalize growth.
            </p>
          </div>
        </aside>

        {/* Main Editorial Copy (Right Column) */}
        <main className="lg:col-span-9 space-y-16">
          
          {/* Section 1: Bottlenecks */}
          <section id="operational-bottlenecks" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">1.</span> The Real Agency Bottlenecks
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                Managing social media for multiple client brands introduces friction that solo creators rarely face. In an agency environment, content creation is gated by multiple handoffs: internal copywriting, design preparation, manager reviews, and final client sign-offs.
              </p>
              <p>
                According to industry workflow reviews by platforms like{" "}
                <a
                  href="https://planable.io/blog/social-media-approval-process/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity font-bold"
                >
                  Planable
                </a>
                , operations stall most frequently during feedback loops. When feedback is scattered across Slack threads, email chains, and shared text files, version control breaks. This leads directly to two risks:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2 text-sm">
                <li>
                  <strong className="text-foreground">Cross-publishing errors:</strong> Accidental deployment of Client A's visual assets or draft captions to Client B's connected social profiles.
                </li>
                <li>
                  <strong className="text-foreground">SLA breaches:</strong> Missing agreed-upon publishing deadlines because client feedback was buried in an unread message thread.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Workspaces */}
          <section id="workspace-architecture" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">2.</span> Workspace Isolation Architecture
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                To resolve the risk of publishing errors, modern agency schedulers isolate clients at the database level. ShipOS uses a <strong className="text-foreground">Workspace Isolation model</strong>.
              </p>
              <p>
                Each client brand is allocated a dedicated, independent Workspace. This workspace acts as a strict sandbox with its own:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="border border-border bg-card p-4">
                  <h4 className="font-bold text-foreground text-sm">Isolated Connection Tokens</h4>
                  <p className="text-xs mt-1">
                    OAuth access tokens for X, LinkedIn, and Instagram are kept strictly inside the workspace boundary. No token can be accidentally shared or accessed from another client's view.
                  </p>
                </div>
                <div className="border border-border bg-card p-4">
                  <h4 className="font-bold text-foreground text-sm">Partitioned Media & Calendars</h4>
                  <p className="text-xs mt-1">
                    Image libraries, scheduled calendars, past posts, and draft queues are unique to each workspace. The UI only loads assets matching the active `workspace_id`.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Cadence */}
          <section id="weekly-cadence" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">3.</span> A Factual Weekly Operating Cadence
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                Stable agency operations run on a structured weekly rhythm. Juggling on-the-fly posting for dozens of profiles introduces errors. We recommend a 5-step operational cadence:
              </p>
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border font-bold text-foreground">
                      <th className="p-3">Day</th>
                      <th className="p-3">Operational Layer</th>
                      <th className="p-3">Activity & Key Deliverables</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { day: "Monday", phase: "Planning Layer", text: "Map the week's campaign goals, define posting requirements, and assign writers to specific slots." },
                      { day: "Tuesday", phase: "Creation Block", text: "Write drafts in the editor, attach visual assets, and build formatting elements (such as bold typography or hooks)." },
                      { day: "Wednesday", phase: "Approval Window", text: "Vet content internally and route drafts to client stakeholders for review. Maintain a clear deadline for responses." },
                      { day: "Thursday", phase: "Scheduling & QA", text: "Once approved, queue posts in the visual calendar. Double-check all UTM tracking links, dimension rules, and mentions." },
                      { day: "Friday", phase: "Metric Audit", text: "Extract platform analytics from the previous week's posts to track actual reach and engagement." },
                    ].map((step) => (
                      <tr key={step.day}>
                        <td className="p-3 font-bold text-[#d75a34] uppercase tracking-wider whitespace-nowrap">{step.day}</td>
                        <td className="p-3 font-mono font-bold text-foreground whitespace-nowrap">{step.phase}</td>
                        <td className="p-3 text-muted-foreground">{step.text}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 4: CSV Schema */}
          <section id="csv-schema" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">4.</span> The CSV Batch Import Schema
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                When planning monthly content cycles, entering posts manually is highly inefficient. ShipOS supports batch spreadsheet imports. To ensure clean queue ingestion, your CSV file must match this standard column schema:
              </p>
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border font-bold text-foreground">
                      <th className="p-3">Column Header</th>
                      <th className="p-3">Data Type</th>
                      <th className="p-3">Format / Limit Rule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { header: "publish_date_utc", type: "Datetime", rule: "ISO 8601 string (e.g., 2026-07-03T18:00:00Z)" },
                      { header: "caption", type: "Text", rule: "Supports platform-specific limits (e.g., 280 chars for X, 3000 for LinkedIn)" },
                      { header: "platforms", type: "Comma-separated text", rule: "List of targets (e.g., 'linkedin,x,instagram')" },
                      { header: "media_url", type: "URL string", rule: "Direct absolute link to image/video asset hosted on a public server" },
                      { header: "link_destination", type: "URL string", rule: "Destination CTA link (UTM parameters should be built in here)" },
                    ].map((row) => (
                      <tr key={row.header}>
                        <td className="p-3 font-mono text-foreground font-bold">{row.header}</td>
                        <td className="p-3">{row.type}</td>
                        <td className="p-3 text-muted-foreground">{row.rule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 5: API constraints */}
          <section id="api-constraints" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">5.</span> Platform and API Boundaries
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4 font-sans">
              <p>
                A professional agency workflow must account for strict platform API limitations. No scheduler has a direct bypass around platform restrictions:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#d75a34] font-bold">•</span>
                  <span>
                    <strong className="text-foreground">X (Twitter) Limits:</strong> Standard accounts have strict character caps (280) and media format limitations. Standard API connections restrict high-frequency automated publishing.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#d75a34] font-bold">•</span>
                  <span>
                    <strong className="text-foreground">LinkedIn Constraints:</strong> While LinkedIn supports 3,000 characters, posting too frequently (e.g., multiple posts per hour) on personal profile pages risks temporary account suspension by the LinkedIn spam engine.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#d75a34] font-bold">•</span>
                  <span>
                    <strong className="text-foreground">Instagram Auto-Publishing:</strong> Direct auto-publishing for carousels or video content depends heavily on having a valid Instagram Business profile. Personal and standard Creator profiles frequently require manual mobile push notifications.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6: Video Walkthrough */}
          <section id="demo-walkthrough" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">6.</span> Video Product Walkthrough
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Before introducing new software to your agency or team, evaluate the actual publishing and workspace switching workflow.
            </p>
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
                      <Play className="w-10 h-10 text-white ml-1 fill-current" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Section 7: Pricing plans */}
          <section id="pricing-plans" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">7.</span> Predictable Flat Pricing
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Avoid scaling models that tax your business per brand or profile. Choose a flat tier based on your connected accounts.
            </p>
            <MarketingPricingCards />

          </section>

          {/* Section 8: FAQs */}
          <section id="operational-faqs" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">8.</span> Operational FAQs
            </h2>
            <div className="divide-y divide-border border-y border-border">
              {faqs.map((faq, i) => (
                <div key={faq.question} className="py-4">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    className="w-full flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="font-bold text-foreground group-hover:text-[#d75a34] transition-colors">{faq.question}</span>
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

          {/* Related pages */}
          <section className="border-t border-border/60 pt-12">
            <h2 className="text-xl font-black text-foreground mb-4">Related pages</h2>
            <div className="grid sm:grid-cols-4 gap-4 text-sm">
              <Link to="/ai-social-media-scheduler" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
                AI social media scheduler
              </Link>
              <Link to="/social-media-calendar-tool" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
                Calendar workflow guide
              </Link>
              <Link to="/compare/buffer" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
                ShipOS vs Buffer
              </Link>
              <Link to="/compare/later" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
                ShipOS vs Later
              </Link>
            </div>
          </section>
        </main>
      </section>

      <Footer />
    </div>
  );
}
