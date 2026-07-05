import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  X,
  Layers,
  Menu,
  Play,
  HelpCircle,
  Cpu,
  Lock,
  Zap,
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
    question: "Is this comparison claiming fixed competitor pricing?",
    answer:
      "No. Vendor pricing and features change over time. This page focuses on decision criteria and workflow fit, then points readers to verify current details on official sources.",
  },
  {
    question: "Who should use ShipOS in this comparison?",
    answer:
      "Teams that want one workflow for planning, AI-assisted drafting, scheduling, and multi-platform operations may prefer ShipOS.",
  },
  {
    question: "Who might prefer Later?",
    answer:
      "Teams focused on visual-first social planning may evaluate Later depending on their channel mix, creative process, and existing tooling.",
  },
];

const menuItems = [
  { id: "philosophy-comparison", label: "1. Core Philosophy" },
  { id: "social-sets", label: "2. Social Sets vs. Workspaces" },
  { id: "visual-planning", label: "3. Grid vs. Slideshow Studio" },
  { id: "bulk-ingestion", label: "4. Bulk Ingestion" },
  { id: "comparison-matrix", label: "5. Feature Matrix" },
  { id: "migration-guide", label: "6. Migration Steps" },
  { id: "demo-walkthrough", label: "7. Video Walkthrough" },
  { id: "pricing-plans", label: "8. Plans & Pricing" },
  { id: "operational-faqs", label: "9. Decision FAQs" },
];

export default function CompareLater() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [activeSection, setActiveSection] = useState("philosophy-comparison");

  // Dynamic ScrollSpy tracking for Sticky Sidebar
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
        title="ShipOS vs Later Comparison — Best Social Media Scheduler alternative"
        description="Factual side-by-side comparison between Later and ShipOS. Compare flat-rate pricing models vs per-profile taxes, native slideshow builders, bulk upload, and advanced AI studio."
        path="/compare/later"
        type="article"
        keywords={["ShipOS vs Later", "Later alternative", "flat rate social media scheduler", "bulk scheduling tool", "slideshow studio creator"]}
        jsonLd={[
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare Later", path: "/compare/later" },
          ]),
          faqSchema(faqs),
        ]}
      />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-8 max-w-7xl mx-auto text-center border-b border-border/60">
        <div className="max-w-4xl mx-auto space-y-4">
          <SectionBadge label="Product Comparison" text="Factual Side-by-Side Analysis" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-foreground">
            Evaluating Visual Planners vs. <br />
            <span className="text-[#d75a34]">Structured Social Media Schedulers.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Later specializes in visual-first social planning and link-in-bio curation. ShipOS focuses strictly on flat-rate calendar automation, multi-brand workspace isolation, and high-speed bulk ingestion.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              onClick={() => navigate("/signup")}
              variant="marketing"
            >
              Start Free 7-Day Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="marketingOutline" onClick={() => scrollTo("comparison-matrix")}>
              View Feature Matrix
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Sidebar Table of Contents */}
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
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Operational Insight</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              If your business relies heavily on Instagram feed layout planning and direct link-in-bio curation, evaluate Later. If your brand wants standard bulk scheduling, multiple workspaces, and flat subscriptions, choose ShipOS.
            </p>
          </div>
        </aside>

        {/* Right Editorial Copy Column */}
        <main className="lg:col-span-9 space-y-16">
          
          {/* Section 1: Core Philosophy */}
          <section id="philosophy-comparison" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">1.</span> Core Philosophies Compared
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                Later (formerly Latergramme) is a highly respected social media management platform widely recognized for its visual-first approach. It was designed to help creators, visual marketers, and retail brands organize, preview, and deploy aesthetic grids on Instagram and Pinterest.
              </p>
              <p>
                <strong className="text-foreground">ShipOS</strong> operates with a structural and systemized focus. Instead of tailoring its layout to Instagram aesthetic grid planning alone, ShipOS is built as a multi-platform productivity engine. It streamlines professional operations by prioritizing high-speed bulk ingestion, database-level client isolation, and simple flat subscriptions.
              </p>
            </div>
          </section>

          {/* Section 2: Social Sets */}
          <section id="social-sets" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">2.</span> Social Sets vs. Database Workspaces
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                How you organize your profiles dictates how many accounts you can manage. Later operates a <strong className="text-foreground">Social Set model</strong>. A Social Set consists of exactly one profile from each supported platform (1 Instagram, 1 Facebook, 1 Twitter, 1 Pinterest, 1 TikTok, 1 LinkedIn). If you have two separate Instagram accounts for different brands, you are forced to purchase an additional Social Set.
              </p>
              <p>
                ShipOS uses a modern, database-isolated <strong className="text-foreground">Workspace Architecture</strong>. Instead of restricting your channels by rigid platform bundles, profiles are allocated on an open count. You can connect up to 15 social accounts on our flat Creator tier and organize them into distinct, sandboxed workspaces however you prefer—without rigid Social Set mathematics.
              </p>
              <p>
                Let’s compare the actual subscription costs side-by-side to understand the cost difference as profile requirements grow:
              </p>
              
              <div className="overflow-x-auto border border-border mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border font-bold text-foreground">
                      <th className="p-3">Requirement & Accounts</th>
                      <th className="p-3">Later Standard Subscriptions</th>
                      <th className="p-3">ShipOS Flat Rate Equivalent</th>
                      <th className="p-3">Total Monthly Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3 font-bold text-foreground">1 Social Set (6 Profiles)</td>
                      <td className="p-3 text-red-600 font-bold">~$25 / month (Starter plan)</td>
                      <td className="p-3 text-green-600 font-bold">$19 / month (Starter plan - up to 5 profiles)</td>
                      <td className="p-3 font-bold text-foreground bg-green-500/5">$6 / mo ($72/yr)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-foreground">3 Social Sets (18 Profiles)</td>
                      <td className="p-3 text-red-600 font-bold">~$45 / month (Growth plan)</td>
                      <td className="p-3 text-green-600 font-bold">$29 / month (Creator plan - up to 15 profiles)</td>
                      <td className="p-3 font-bold text-foreground bg-green-500/5">$16 / mo ($192/yr)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-foreground">6 Social Sets (36 Profiles)</td>
                      <td className="p-3 text-red-600 font-bold">~$80 / month (Advanced plan)</td>
                      <td className="p-3 text-green-600 font-bold">$49 / month (Pro plan - Unlimited profiles)</td>
                      <td className="p-3 font-bold text-foreground bg-green-500/5">$31 / mo ($372/yr)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 3: Grid vs. Slideshow Studio */}
          <section id="visual-planning" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">3.</span> Visual Instagram Grid vs. Slideshow Studio
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                Visual strategy differs by channel. Later's core strength is its interactive Instagram Grid Planner. You can drag and drop images to see how your future feed looks visually on a mobile screen before posting.
              </p>
              <p>
                ShipOS focuses creative energy on high-engagement carousel and slide content. Our native <strong className="text-foreground">Slideshow Studio</strong> is built directly into the composer. You can write slides, apply clean templates, format per-page layouts, and publish high-engagement multi-image carousels for LinkedIn and Instagram natively—with no external Canva exports required.
              </p>
            </div>
          </section>

          {/* Section 4: Bulk Ingestion */}
          <section id="bulk-ingestion" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">4.</span> Drag & Drop Media vs. Bulk CSV Ingestion
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                How you queue your content matters. Later excels at media-led flows. You upload files to a visual media library, then drag those assets onto calendar time slots to schedule them individually.
              </p>
              <p>
                ShipOS excels at structured, text-led, and programmatic queueing. Our native <strong className="text-foreground">Bulk File Scheduler</strong> parses CSV, TSV, or plain text documents containing up to 50 pre-drafted posts (captions, publish dates, media URLs, and CTA links). Drag the file in, validate your rows, and schedule your entire month's calendar in one step.
              </p>
            </div>
          </section>

          {/* Section 5: Feature Comparison Matrix */}
          <section id="comparison-matrix" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">5.</span> Feature Comparison Matrix
            </h2>
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted border-b border-border font-bold text-foreground">
                    <th className="p-3">Capability & Integration Parameter</th>
                    <th className="p-3 bg-primary/5 text-primary text-center">ShipOS</th>
                    <th className="p-3 text-center">Later</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {[
                    { f: "Pricing Model", s: "Predictable Flat Rates", p: "Bundled Social Set Tiers" },
                    { f: "Account Allocation Model", s: "Open Count (No bundle limits)", p: "Social Set Bundles (1 of each per brand)" },
                    { f: "Native Slideshow & Carousel Creator", s: "Yes (Built-In Studio)", p: "No (Manual canvas uploading)" },
                    { f: "Bulk CSV / Spreadsheet Ingestion", s: "Yes (Live validation parsing)", p: "No (Must input one-by-one)" },
                    { f: "Visual Instagram Feed Planner", s: "No", p: "Yes (Drag & drop visual grid)" },
                    { f: "Secure Multi-Brand Workspaces", s: "Yes (Database-isolated sandboxes)", p: "Yes (Social Set isolation)" },
                    { f: "Active Bluesky Channel API", s: "Yes (Direct OAuth publishing)", p: "No" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="p-3 font-semibold text-foreground">{row.f}</td>
                      <td className="p-3 bg-primary/5 text-center text-primary font-bold">{row.s}</td>
                      <td className="p-3 text-center text-muted-foreground">{row.p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6: Migration Steps */}
          <section id="migration-guide" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">6.</span> Painless Migration in 3 Steps
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                Transferring your operational schedule from Later to ShipOS is simple and requires zero downtime for your active channels:
              </p>
              <div className="border border-border bg-card divide-y divide-border">
                {[
                  { step: "01 — Export Later Queue", text: "Download your queued posts as a standard CSV file directly from your Later calendar settings page." },
                  { step: "02 — Connect Social Accounts", text: "Authorize your channels securely in ShipOS in under 3 minutes using direct, official OAuth 2.0. No password stored." },
                  { step: "03 — Bulk Upload & Go Live", text: "Drag your exported CSV directly into the ShipOS Bulk Scheduler. The live validator parses and queues your posts instantly." },
                ].map((item) => (
                  <div key={item.step} className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                    <span className="text-xs font-black text-[#d75a34] tracking-wider uppercase min-w-[220px] shrink-0">
                      {item.step}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground font-normal">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 7: Video Walkthrough */}
          <section id="demo-walkthrough" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">7.</span> Video Product Walkthrough
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Verify how the visual queue, calendar switching, and multi-workspace client isolation work before adopting the platform.
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

          {/* Section 8: Pricing plans */}
          <section id="pricing-plans" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">8.</span> Flat Monthly Plans
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unlock unlimited scheduling capabilities under one flat subscription tier. Toggle the billing switcher below to lock in the 20% annual discount.
            </p>
            <MarketingPricingCards />

          </section>

          {/* Section 9: Decision FAQs */}
          <section id="operational-faqs" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">9.</span> Decision FAQs
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
              <Link to="/compare/hootsuite" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
                ShipOS vs Hootsuite
              </Link>
            </div>
          </section>
        </main>
      </section>

      <Footer />
    </div>
  );
}
