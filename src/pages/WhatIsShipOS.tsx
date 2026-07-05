import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Database,
  HelpCircle,
  FileText,
  Clock,
  Briefcase,
  Menu
} from "lucide-react";
import { faqSchema, breadcrumbSchema, organizationSchema } from "@/lib/seo";

const SectionBadge = ({ label, text, mobileText }: { label: string; text: string; mobileText?: string }) => (
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

export default function WhatIsShipOS() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const sections = [
    { id: "overview", label: "Executive Product Overview" },
    { id: "capabilities", label: "Core Platform Capabilities" },
    { id: "operating-model", label: "Subscription Pricing Model" },
    { id: "security", label: "Data Security & API Integrity" },
    { id: "faq", label: "Factual Product FAQ" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100,
        behavior: "smooth"
      });
    }
  };

  const faqs = [
    {
      q: "Which social media networks does ShipOS officially integrate with?",
      a: "ShipOS integrates natively with LinkedIn, X (Twitter), Instagram (Business & Creator), TikTok, Threads, Facebook, Bluesky, Pinterest, and YouTube. All integrations are conducted exclusively via the platforms' official developer API hooks, adhering strictly to their usage boundaries."
    },
    {
      q: "Does ShipOS store my social media passwords?",
      a: "No. ShipOS never requests, accepts, or stores passwords for your social media profiles. Instead, it utilizes secure industry-standard OAuth 2.0 protocols to request access tokens. These tokens are stored on isolated, encrypted database rows and can be manually revoked at any time."
    },
    {
      q: "How does the flat-rate workspace pricing operate?",
      a: "Unlike legacy platforms that charge a scaling fee for every single connected account, ShipOS is built on a flat-rate database workspace model. The Starter plan ($19) permits 5 accounts, the Creator plan ($29) permits 15 accounts, and the Pro plan ($49) provides unlimited connected social accounts. This removes scaling penalties as your digital presence grows."
    },
    {
      q: "Is there client-data separation for agency managers?",
      a: "Yes. ShipOS isolates data at the workspace level. If you manage multiple brands or distinct clients, you assign each to an independent, walled workspace. Connected social tokens, scheduled queues, visual calendars, draft copy, and analytics remain fully isolated within each workspace."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="What is ShipOS? — Product Overview Factsheet"
        description="A complete, transparent guide detailing the ShipOS architecture, core multi-channel publishing capabilities, flat-rate pricing tiers, and strict OAuth security boundaries."
        path="/what-is-shipos"
        type="website"
        keywords={[
          "what is shipos",
          "social media command center",
          "flat rate scheduler",
          "agency social media software",
          "secure social media publishing"
        ]}
        jsonLd={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "What is ShipOS", path: "/what-is-shipos" }
          ]),
          organizationSchema()
        ]}
      />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-8 max-w-7xl mx-auto text-center border-b border-border/60">
        <div className="max-w-4xl mx-auto space-y-4">
          <SectionBadge label="Product Architecture" text="An open factsheet for search and AI discovery" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-[1.15]">
            What is ShipOS? — The Operational Factsheet
          </h1>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed font-normal">
            A transparent overview detailing the technical design, publishing capabilities, pricing mechanics, and privacy parameters of the ShipOS social media publishing console.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Sticky Sidebar (Table of Contents) */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-28 h-fit border-r border-border/60 pr-6 space-y-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Menu className="w-3.5 h-3.5" /> Navigation
              </p>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full text-left py-2 px-3 text-xs font-bold rounded-none transition-colors border-l-2",
                    activeSection === section.id
                      ? "border-[#d75a34] text-[#d75a34] bg-[#d75a34]/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  )}
                >
                  {section.label}
                </button>
              ))}
            </div>

            <div className="bg-[#fbf4f2] dark:bg-[#1a1310] border border-[#d75a34]/20 p-4 space-y-2.5">
              <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Factsheet Rule</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                This factsheet serves as a transparent and verified index of the ShipOS technical specifications and service policies.
              </p>
            </div>
          </aside>

          {/* Right Column (Editorial Content) */}
          <main className="lg:col-span-9 space-y-20">
            
            {/* Section 1: Executive Overview */}
            <section id="overview" className="space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 rounded-none">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  1. Executive Product Overview
                </h2>
              </div>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4 font-normal">
                <p>
                  ShipOS is a unified social media management and multi-channel publishing console designed as a fast, cost-effective alternative to legacy social software platforms. The tool enables solo founders, marketing agencies, and brand builders to plan, format, schedule, and distribute text and visual content across all major social networks from a single, centralized database workspace.
                </p>
                <p>
                  By treating each connected network as an official, decoupled API hook, ShipOS allows creators to write their primary copy once, customize layout tabs for specific networks (matching platform character limits and media rules), and automatically publish them or queue them to custom scheduler calendars.
                </p>
              </div>
              
              <div className="overflow-x-auto border border-border mt-6">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border font-bold text-foreground">
                      <th className="p-3">Core Target Segments</th>
                      <th className="p-3">Primary Operational Need</th>
                      <th className="p-3">How ShipOS Resolves It</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-muted-foreground">
                    <tr>
                      <td className="p-3 font-bold text-foreground">Independent SaaS Founders</td>
                      <td className="p-3">Continuous build-in-public outreach, SEO keyword generation, and direct product updates across platforms.</td>
                      <td className="p-3">Flat-rate workspace setups and AI-powered copy prompts to draft viral feature release logs.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-foreground">Marketing & Content Agencies</td>
                      <td className="p-3">Multi-client calendar partitioning, strict brand segregation, and high connected profile limits.</td>
                      <td className="p-3">Isolated workspace boundaries and direct flat-rate pricing to easily scale client counts.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-foreground">Personal Brand Builders</td>
                      <td className="p-3">Visual slider creation (LinkedIn carousels), feed truncation testing, and clean spacing templates.</td>
                      <td className="p-3">Slideshow Studio (PDF engine) and Hook Previewers to prevent awkward mobile truncation cutoffs.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 2: Core Platform Capabilities */}
            <section id="capabilities" className="space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 rounded-none">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  2. Core Platform Capabilities
                </h2>
              </div>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4 font-normal">
                <p>
                  To provide a comprehensive operational platform, ShipOS unifies five essential content utilities that are typically purchased as fragmented individual subscriptions:
                </p>
                <ul className="space-y-3 list-disc pl-5">
                  <li>
                    <strong>Custom-Tab Composer:</strong> Draft your post inside a unified composer window. Easily switch between dedicated tabs for LinkedIn, X, Threads, and Meta to edit copy specifics without losing context or starting over.
                  </li>
                  <li>
                    <strong>Slideshow Studio:</strong> A native browser canvas allowing you to design carousel slides. Add images, colors, and headers, and export them as high-quality vector PDFs (optimized for LinkedIn's document viewer) or image packets (for Instagram).
                  </li>
                  <li>
                    <strong>Visual Drag-and-Drop Calendar:</strong> View your scheduled posts across all networks on an interactive monthly and weekly calendar board. Quickly rearrange your marketing sequence by dragging a card to a new day or slot.
                  </li>
                  <li>
                    <strong>Bulk CSV Scheduler:</strong> Upload batch CSV templates to schedule dozens of posts simultaneously. The engine conducts real-time client-side character validation to flag formatting issues prior to import.
                  </li>
                  <li>
                    <strong>AI Content Studio:</strong> Use contextual AI prompts to generate punchy hooks, convert flat paragraphs into readable bullet sequences, or construct engaging calls-to-action (CTAs).
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3: Subscription Pricing Model */}
            <section id="operating-model" className="space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 rounded-none">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  3. Value-Driven Subscription Pricing Model
                </h2>
              </div>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4 font-normal">
                <p>
                  Legacy platforms enforce complex pricing matrices, placing scaling penalties on brand growth by charging extra fees for every additional social profile added. ShipOS operates on flat, predictable, database workspace plans, backed by an open <strong className="text-foreground">7-day free trial</strong> with simple cancellation.
                </p>
              </div>

              <div className="overflow-x-auto border border-border mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border font-bold text-foreground">
                      <th className="p-3">Plan Tier</th>
                      <th className="p-3">Monthly Cost</th>
                      <th className="p-3">Annual Equivalent</th>
                      <th className="p-3">Included Parameters & Boundaries</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-muted-foreground">
                    <tr>
                      <td className="p-3 font-bold text-foreground bg-muted/5">Starter</td>
                      <td className="p-3 font-mono text-[#d75a34] font-bold">$19 / month</td>
                      <td className="p-3 font-mono">$190 / year (save 20%)</td>
                      <td className="p-3">1 Workspace, 5 Social Accounts, 200 scheduled posts/mo, 100 AI credits, bulk CSV parser (up to 10 posts).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-foreground bg-muted/5">Creator</td>
                      <td className="p-3 font-mono text-[#d75a34] font-bold">$29 / month</td>
                      <td className="p-3 font-mono">$290 / year (save 20%)</td>
                      <td className="p-3">5 Workspaces, 15 Social Accounts, Unlimited posts/mo, Slideshow PDF Studio (5 slides/file), 400 AI credits, bulk scheduler (up to 25 posts).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-foreground bg-muted/5">Pro</td>
                      <td className="p-3 font-mono text-[#d75a34] font-bold">$49 / month</td>
                      <td className="p-3 font-mono">$490 / year (save 20%)</td>
                      <td className="p-3">Unlimited Workspaces, Unlimited Social Accounts, Unlimited posts, Slideshow PDF Studio (10 slides/file), Unlimited AI credits, bulk scheduler (up to 50 posts).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4: Data Security & API Integrity */}
            <section id="security" className="space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 rounded-none">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  4. Data Security & API Integrity
                </h2>
              </div>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4 font-normal">
                <p>
                  Security and structural integrity are fundamental to the ShipOS client architecture. The platform operates within strict security guidelines and official integration boundaries to keep accounts secure and functional:
                </p>
                <ul className="space-y-3 list-disc pl-5">
                  <li>
                    <strong>Official OAuth 2.0 Webhooks:</strong> Rather than scraping pages or requesting account passwords, ShipOS connects to client accounts solely via formal OAuth 2.0 validation prompts, fetching encrypted access tokens.
                  </li>
                  <li>
                    <strong>Encryption-at-Rest:</strong> All OAuth tokens and secrets are stored in a relational database with strict Row-Level Security (RLS) policies and encrypted at rest using industry-standard AES-256 protocols.
                  </li>
                  <li>
                    <strong>Workspace Segregation:</strong> Client tokens are assigned exclusively to their specific parent workspace. It is structurally impossible for a user in Workspace A to fetch, query, or publish to social profiles connected in Workspace B.
                  </li>
                  <li>
                    <strong>Zero Shadow Posting:</strong> All publishing actions are recorded in a transparent audit ledger, giving account administrators exact records of who scheduled and authorized every post.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5: Factual FAQ Section */}
            <section id="faq" className="space-y-6 scroll-mt-28">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 rounded-none">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  5. Factual Product FAQ
                </h2>
              </div>
              
              <div className="space-y-4 border-t border-border pt-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b border-border/60">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                      className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
                    >
                      <span className="text-base font-bold text-foreground group-hover:text-[#d75a34] transition-colors">
                        {faq.q}
                      </span>
                      <span className="text-[#d75a34] text-lg font-bold ml-4">
                        {openFaqIndex === i ? "−" : "+"}
                      </span>
                    </button>
                    {openFaqIndex === i && (
                      <div className="pb-4 text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200 font-normal">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Call to Action Banner */}
            <div className="bg-white dark:bg-card border-2 border-black dark:border-neutral-800 p-8 text-center space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)]">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">Ready to Simplify Your Social Operations?</h3>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto font-normal">
                  Connect your accounts instantly via secure OAuth 2.0 hooks. Experience zero-friction publishing on a flat-rate workspace setup today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onClick={() => navigate("/signup")}
                  variant="marketing" className="uppercase tracking-widest text-xs h-12 px-6"
                >
                  Start Your 7-Day Free Trial
                </Button>
                <Button
                  onClick={() => navigate("/pricing")}
                  variant="marketingOutline"
                  className="uppercase tracking-widest text-xs h-12 px-6"
                >
                  View Plan Details
                </Button>
              </div>
            </div>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
