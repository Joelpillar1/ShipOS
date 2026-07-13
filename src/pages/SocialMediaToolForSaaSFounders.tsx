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
    question: "How does building-in-public actually translate to search and GEO?",
    answer:
      "Search and Generative Engine Optimization (GEO) heavily prioritize raw, authentic user-generated experiences and documentable outcomes over polished marketing copy. When a founder documents real technical challenges, database schemas, framework choices, or conversion metrics, search engines index these highly distinct and detailed keyword variations. ShipOS helps founders schedule these factual stories systematically.",
  },
  {
    question: "Does ShipOS guarantee viral reach or SaaS signups?",
    answer:
      "No. ShipOS is a robust scheduling, calendar, and queuing mechanism. Your viral reach and signup conversion rate depend strictly on the quality of your product, the positioning of your value proposition, and the resonance of your editorial writing.",
  },
  {
    question: "Can I coordinate major product launches on ShipOS?",
    answer:
      "Yes. Founders often prepare multi-platform launch threads for Product Hunt or beta milestones. ShipOS allows you to queue these sequences in advance to hit target timezones. However, direct automated scheduling of multi-level threads on X (Twitter) depends on standard platform API limits.",
  },
  {
    question: "What channels are supported for SaaS brand building?",
    answer:
      "ShipOS supports publishing to LinkedIn (personal profiles and company pages), X/Twitter profiles, and Instagram (via Meta Business accounts). This covers the primary networks where SaaS founders drive professional and developer-led traffic.",
  },
];

const menuItems = [
  { id: "founder-bottlenecks", label: "1. The Time Paradox" },
  { id: "build-in-public-matrix", label: "2. Content Pillars" },
  { id: "distribution-cadence", label: "3. Weekly Cadence" },
  { id: "link-preview-rules", label: "4. Link Preview Behavior" },
  { id: "launch-api-limits", label: "5. Platform Limitations" },
  { id: "demo-walkthrough", label: "6. Video Walkthrough" },
  { id: "pricing-plans", label: "7. Plans & Pricing" },
  { id: "operational-faqs", label: "8. Operational FAQs" },
];

export default function SocialMediaToolForSaaSFounders() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [activeSection, setActiveSection] = useState("founder-bottlenecks");

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
        title="Social Media Management for SaaS Founders — Operational Guide"
        description="Learn how busy SaaS founders manage social media: content pillars, systematic week-to-week distribution, link preview behaviors, and direct platform limitations."
        path="/social-media-tool-for-saas-founders"
        type="website"
        keywords={[
          "saas founder social media workflow",
          "build in public scheduler",
          "social media tool for saas founders",
          "product launch queue tool",
          "developer marketing scheduler",
        ]}
        jsonLd={[
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Social Media Tool for SaaS Founders", path: "/social-media-tool-for-saas-founders" },
          ]),
          faqSchema(faqs),
          howToSchema({
            name: "How busy SaaS founders run content distribution systems",
            description: "Build content pillars, set up automatic weekly scheduling, and analyze channel referrals.",
            path: "/social-media-tool-for-saas-founders",
            steps: [
              { name: "Establish build-in-public pillars", text: "Map development updates, product metrics, and pain-point features." },
              { name: "Batch distribution weekly", text: "Queue all updates in one dedicated weekly block to maintain focus on product building." },
              { name: "Analyze actual referrals", text: "Track signups against your scheduled UTM campaigns to evaluate conversion rate." },
            ],
          }),
        ]}
      />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-8 max-w-7xl mx-auto text-center border-b border-border/60">
        <div className="max-w-4xl mx-auto space-y-4">
          <SectionBadge label="SaaS Growth" text="Build-in-Public Content Distribution Guide" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-foreground">
            The SaaS Founder's Guide to Social Media Distribution
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            An operational, zero-hype manual for software founders. Learn how to design high-intent content pillars, manage weekly posting pipelines, evaluate link preview rules, and respect platform API constraints.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              onClick={() => navigate("/founder")}
              variant="marketing"
            >
              See founder offer <ArrowRight className="w-4 h-4 ml-2" />
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
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Operational Focus</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              SaaS marketing succeeds when distribution is treated like a repeatable code deployment pipeline rather than an ad-hoc chore.
            </p>
          </div>
        </aside>

        {/* Main Editorial Copy (Right Column) */}
        <main className="lg:col-span-9 space-y-16">
          
          {/* Section 1: The Time Paradox */}
          <section id="founder-bottlenecks" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">1.</span> The SaaS Founder's Time Paradox
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                SaaS founders operate under high coordination taxes. In a single afternoon, a founder shifts from writing production code or fixing database queries to answering customer support tickets and analyzing server response times.
              </p>
              <p>
                Because product development demands deep concentration, marketing is often treated as an after-thought. When social updates are written on-the-fly, quality suffers, consistency breaks down, and referral tracking is forgotten.
              </p>
              <p>
                Industry growth studies show that organic search and social media remain the primary low-cost user acquisition channels for early-stage software companies. Attempting to post manually throughout the day fragments your focus, while ignoring distribution entirely leaves your product invisible. The solution is separating the creation block from the publishing engine.
              </p>
            </div>
          </section>

          {/* Section 2: Content Pillars */}
          <section id="build-in-public-matrix" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">2.</span> High-Intent Content Pillars
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                SaaS distribution fails when it only consists of generic "Check out my tool" posts. Instead, software growth hinges on structured pillars that prove technical expertise, document build decisions, and solve real customer problems:
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <div className="border border-border bg-card p-4">
                  <h4 className="font-bold text-foreground text-sm">Build in Public</h4>
                  <p className="text-xs mt-1">
                    Document system designs, architecture trade-offs, refactoring blocks, and database indexes. This builds long-term authority and commands high technical interest.
                  </p>
                </div>
                <div className="border border-border bg-card p-4">
                  <h4 className="font-bold text-foreground text-sm">Pain Point Focus</h4>
                  <p className="text-xs mt-1">
                    Deconstruct a painful manual process or costly mistake your target customer struggles with, then demonstrate how automated tools eliminate that friction.
                  </p>
                </div>
                <div className="border border-border bg-card p-4">
                  <h4 className="font-bold text-foreground text-sm">Product Milestones</h4>
                  <p className="text-xs mt-1">
                    Share features released, bug fixes completed, active user volumes, or honest post-mortems of downtime. Transparency generates customer trust.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Cadence */}
          <section id="distribution-cadence" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">3.</span> A Factual Content Cadence Matrix
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                Successful founders treat marketing like a deployment schedule. Rather than scheduling posts every day, they use a structured weekly pipeline to write, review, and ship updates in batches:
              </p>
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border font-bold text-foreground">
                      <th className="p-3">Day</th>
                      <th className="p-3">Operating Goal</th>
                      <th className="p-3">Deliverables & Deliverable Rules</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { day: "Monday", phase: "Pillar Planning", text: "Audit previous week's git commits, changelogs, or customer tickets. Outline 3 to 5 core marketing hooks." },
                      { day: "Tuesday", phase: "Batch Copywriting", text: "Draft text in a single block inside the social editor. Build formatting elements (e.g., custom code-blocks or lists)." },
                      { day: "Wednesday", phase: "Media Ingestion", text: "Capture product screenshots, interface recordings, or dashboard metrics. Attach them directly to the drafts." },
                      { day: "Thursday", phase: "UTM Audit & Ingestion", text: "Map custom UTM tracking parameters to landing page URLs. Inspect links before scheduling them into the queue." },
                      { day: "Friday", phase: "Weekly Analysis", text: "Verify actually sent traffic in GA4 or Plausible. Adjust upcoming campaign priorities based on raw conversion rates." },
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

          {/* Section 4: Link Preview Rules */}
          <section id="link-preview-rules" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">4.</span> Link Preview & Meta Behavior
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                When a founder shares product updates, the layout of link previews heavily dictates CTR (Click-Through Rate). Every platform has distinct protocols for handling Open Graph (OG) metadata:
              </p>
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border font-bold text-foreground">
                      <th className="p-3">Platform</th>
                      <th className="p-3">OG Rule & Image Dimensions</th>
                      <th className="p-3">Formatting Constraint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { platform: "X (Twitter)", image: "Card types: summary_large_image (1200 x 630px)", rule: "Title/descriptions are nested beneath the image; crop rules are tight." },
                      { platform: "LinkedIn", image: "Standard OG card: 1.91:1 ratio (1200 x 627px)", rule: "Supports rich article cards. Note: post reach is often reduced when a link is included directly in the caption text." },
                      { platform: "Instagram", image: "No direct click-previews in post descriptions", rule: "All destinations must be driven through a single 'Link in Bio' or targeted Story tags." },
                    ].map((row) => (
                      <tr key={row.platform}>
                        <td className="p-3 font-bold text-[#d75a34] uppercase tracking-wider whitespace-nowrap">{row.platform}</td>
                        <td className="p-3 font-mono font-bold text-foreground">{row.image}</td>
                        <td className="p-3 text-muted-foreground">{row.rule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 5: API constraints */}
          <section id="launch-api-limits" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">5.</span> Platform API and Launch Limitations
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4 font-sans">
              <p>
                A reliable software distribution pipeline must respect official platform API limitations. Let's look at the technical boundaries that no third-party scheduler can bypass:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#d75a34] font-bold">•</span>
                  <span>
                    <strong className="text-foreground">X/Twitter Thread Scheduling:</strong> Scheduling multi-post threads depends heavily on X's API level constraints. Free or low-tier accounts are restricted to single-post scheduling.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#d75a34] font-bold">•</span>
                  <span>
                    <strong className="text-foreground">LinkedIn API limits:</strong> Personal profiles have weekly posting ceilings enforced by LinkedIn's anti-spam engine. Attempting to automate dozens of updates daily will trigger temporary account restrictions.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#d75a34] font-bold">•</span>
                  <span>
                    <strong className="text-foreground">Instagram Auto-publishing:</strong> Only supports direct auto-publishing of static images, carousels, or reels when connected via a verified Meta Business Suite profile. Personal or Standard Creator profiles still require mobile push notifications to deploy.
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
              Before choosing a scheduler to manage your software's growth distribution, review how the visual calendar, draft composer, and active workspaces switch.
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
              <span className="text-[#d75a34]">7.</span> Flat Pricing for Software Brands
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Don't get penalized with pricing tiers that scale per profile. Select a simple flat plan matching your active channel needs. Ready to close on Pro or Lifetime only?{" "}
              <Link to="/founder" className="text-[#d75a34] underline underline-offset-2 font-semibold">
                Open the founder pitch page
              </Link>
              .
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
              <Link to="/founder" className="border border-border bg-card p-4 hover:border-[#d75a34]/50 font-semibold">
                Founder pitch — Pro & Lifetime
              </Link>
              <Link to="/ai-social-media-scheduler" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
                AI social media scheduler
              </Link>
              <Link to="/social-media-calendar-tool" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
                Calendar workflow guide
              </Link>
              <Link to="/social-media-tool-for-agencies" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
                For marketing agencies
              </Link>
              <Link to="/compare/buffer" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
                ShipOS vs Buffer
              </Link>
            </div>
          </section>
        </main>
      </section>

      <Footer />
    </div>
  );
}
