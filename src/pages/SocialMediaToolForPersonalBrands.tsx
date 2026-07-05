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
    question: "How does a personal brand rank in search engines and GEO?",
    answer:
      "Search and Generative Engines (GEO) heavily value first-hand experience and individual expertise (E-E-A-T). Factual, original perspectives about career lessons, technical workflows, and real experiments perform significantly better than generic AI-generated advice. ShipOS provides the workspace, formatting tools, and scheduling queues to help authors distribute these authentic insights.",
  },
  {
    question: "Does ShipOS guarantee profile growth or follower count increases?",
    answer:
      "No. Follower growth, impressions, and engagement are determined by your content's quality, timing, relevance to your target audience, and platform algorithms. ShipOS is the drafting, formatting, scheduling, and calendar hub to help you run a consistent workflow.",
  },
  {
    question: "How are unicode formatting styles (bold/italic) handled on LinkedIn?",
    answer:
      "While unicode mathematical characters can display bold or italic text on LinkedIn and X, they are technically unreadable by screen-readers used by visually impaired users, and search engines cannot index unicode-styled keywords correctly. ShipOS includes built-in text formatting previews but recommends using standard, clean text for primary keywords to preserve accessibility and search crawlability.",
  },
  {
    question: "Can I manage multiple client profiles if I am a ghostwriter?",
    answer:
      "Yes. If you write for multiple executives or clients, you can create a dedicated Workspace for each person. This isolates drafting calendars, connected accounts, and scheduling queues, preventing accidental post crossovers.",
  },
];

const menuItems = [
  { id: "personal-brand-fatigue", label: "1. The Content Fatigue" },
  { id: "brand-pillars", label: "2. Creator Content Pillars" },
  { id: "creator-cadence", label: "3. Weekly Cadence" },
  { id: "hook-formatting", label: "4. Formatting Guidelines" },
  { id: "profile-api-boundaries", label: "5. Profile API Boundaries" },
  { id: "demo-walkthrough", label: "6. Video Walkthrough" },
  { id: "pricing-plans", label: "7. Plans & Pricing" },
  { id: "operational-faqs", label: "8. Operational FAQs" },
];

export default function SocialMediaToolForPersonalBrands() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [activeSection, setActiveSection] = useState("personal-brand-fatigue");

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
        title="Social Media Management for Personal Brands — Operational Guide"
        description="A clear, tactical manual on building a personal brand: content planning, weekly distribution calendars, keyword indexing formatting rules, and API constraints."
        path="/social-media-tool-for-personal-brands"
        type="website"
        keywords={[
          "personal branding workflow",
          "social media tool for personal brands",
          "creator scheduling software",
          "executive ghostwriting queue",
          "thought leadership distribution",
        ]}
        jsonLd={[
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Social Media Tool for Personal Brands", path: "/social-media-tool-for-personal-brands" },
          ]),
          faqSchema(faqs),
          howToSchema({
            name: "How creators and executives operate consistent social queues",
            description: "Build career-centric content pillars, queue posts weekly, format for readability, and analyze referrals.",
            path: "/social-media-tool-for-personal-brands",
            steps: [
              { name: "Define authentic pillars", text: "Map career insights, operational lessons, and raw industry reviews." },
              { name: "Isolate client workspaces", text: "If managing other executives, separate accounts by brand sandbox." },
              { name: "Schedule consistently", text: "Commit scheduled content to weekly visual calendars for consistent delivery." },
            ],
          }),
        ]}
      />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-8 max-w-7xl mx-auto text-center border-b border-border/60">
        <div className="max-w-4xl mx-auto space-y-4">
          <SectionBadge label="Personal Branding" text="Thought Leadership Distribution Manual" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-foreground">
            The Personal Brand Guide to Structured Social Media Distribution
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            A practical, factual workflow manual for creators, executives, and ghostwriters. Learn how to map high-authority content pillars, format for reader accessibility, execute weekly queues, and respect profile constraints.
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
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Operational Focus</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Building a personal brand is an operational endurance test. Systems that reduce friction outlast fleeting viral tactics.
            </p>
          </div>
        </aside>

        {/* Main Editorial Copy (Right Column) */}
        <main className="lg:col-span-9 space-y-16">
          
          {/* Section 1: The Content Fatigue */}
          <section id="personal-brand-fatigue" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">1.</span> The Personal Brand Content Fatigue
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                Developing a personal brand or managing profiles for industry executives is highly demanding. When posting depends on manual day-to-day writing, consistency quickly falters. Critical business tasks inevitably interrupt publishing cycles.
              </p>
              <p>
                This issue is compounded for professional ghostwriters or marketing teams managing multiple personal accounts. Without workspace sandboxing, it is exceptionally easy to make cross-posting mistakes—deploying highly sensitive career stories or personal updates to the incorrect connected profile.
              </p>
              <p>
                Data confirms that professional credibility depends on sustained, high-quality, and niche-focused distribution over months. Trying to publish on-the-fly throughout the day fractures mental focus, while abandoning social pipelines reduces market authority. Separating writing blocks from scheduling blocks provides the operational framework needed to persist.
              </p>
            </div>
          </section>

          {/* Section 2: Creator Content Pillars */}
          <section id="brand-pillars" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">2.</span> Authority-Led Content Pillars
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                Personal brands thrive on specificity, transparency, and documented lessons. The most successful builders rely on three core content pillars to establish trust and index for relevant industry searches:
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <div className="border border-border bg-card p-4">
                  <h4 className="font-bold text-foreground text-sm">Professional Frameworks</h4>
                  <p className="text-xs mt-1">
                    Deconstruct proprietary strategies, operating checklists, or project systems you use in your daily work. This proves hands-on capability.
                  </p>
                </div>
                <div className="border border-border bg-card p-4">
                  <h4 className="font-bold text-foreground text-sm">Case Studies & Metrics</h4>
                  <p className="text-xs mt-1">
                    Share honest metrics, project parameters, revenue growth patterns, or deep operational failure reports. Transparency commands high audience interest.
                  </p>
                </div>
                <div className="border border-border bg-card p-4">
                  <h4 className="font-bold text-foreground text-sm">Industry Commentary</h4>
                  <p className="text-xs mt-1">
                    Provide specialized perspectives on breaking sector news, technical changes, or platform shifts. This frames your profile as an active market voice.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Creator Cadence */}
          <section id="creator-cadence" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">3.</span> A Factual Creator Operating Cadence
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                Maintaining consistent channels requires treating content distribution like a recurring operating sprint. Use this systematic weekly blueprint to write, review, and lock in your updates:
              </p>
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border font-bold text-foreground">
                      <th className="p-3">Day</th>
                      <th className="p-3">Operating Phase</th>
                      <th className="p-3">Factual Focus & Action Steps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { day: "Monday", phase: "Insights Extraction", text: "Review active projects, client outcomes, or technical notebooks. Extract 3 to 5 core operational concepts." },
                      { day: "Tuesday", phase: "Structured Copywriting", text: "Draft post content in a single block inside the social editor. Apply clean formatting parameters for high legibility." },
                      { day: "Wednesday", phase: "Media Gathering", text: "Ingest clear visual screenshots, analytics graphs, or video files. Attach the correct creative file to each draft." },
                      { day: "Thursday", phase: "Formatting Audit & QA", text: "Pre-inspect drafts against target channel criteria (character counts, spacing limits, and mentions)." },
                      { day: "Friday", phase: "Performance Review", text: "Audit referral data to verify actual clicks and signups. Adjust future content targets based on empirical results." },
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

          {/* Section 4: Formatting Guidelines */}
          <section id="hook-formatting" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">4.</span> Copywriting Formatting Guidelines
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                To maximize post readability, professional creators follow strict text limits and visual layouts. The grid below maps the exact specifications required to ensure clean indexing and reading layouts:
              </p>
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border font-bold text-foreground">
                      <th className="p-3">Target Platform</th>
                      <th className="p-3">Character Ceiling</th>
                      <th className="p-3">Formatting Rules & Accessibility Warnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { platform: "LinkedIn Profile", limit: "3,000 characters", rule: "We recommend breaking paragraphs every 2-3 lines. Bold/italic unicode text generator tools are unreadable by screen-readers and can harm Search Crawlers." },
                      { platform: "X / Twitter Standard", limit: "280 characters", rule: "Threads should display cohesive narrative sequences. Single posts are ideal for direct statements, and links are best formatted at the bottom." },
                      { platform: "Instagram Feed", limit: "2,200 characters", rule: "Requires clean line breaks to avoid text clustering. Direct hyperlinked URLs in comments or captions are not clickable." },
                    ].map((row) => (
                      <tr key={row.platform}>
                        <td className="p-3 font-bold text-[#d75a34] uppercase tracking-wider whitespace-nowrap">{row.platform}</td>
                        <td className="p-3 font-mono font-bold text-foreground whitespace-nowrap">{row.limit}</td>
                        <td className="p-3 text-muted-foreground">{row.rule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 5: Profile API Boundaries */}
          <section id="profile-api-boundaries" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">5.</span> Platform Profile Limitations
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4 font-sans">
              <p>
                Operating a systematic publishing queue requires accounting for strict platform API limitations. No scheduler has a direct bypass around platform-level constraints:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#d75a34] font-bold">•</span>
                  <span>
                    <strong className="text-foreground">LinkedIn Personal vs Company Reach:</strong> Algorithms often prioritize personal profile posts over company pages. However, API constraints require secure active tokens for personal profiles which expire and must be re-authenticated periodically.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#d75a34] font-bold">•</span>
                  <span>
                    <strong className="text-foreground">X (Twitter) Threading limits:</strong> Direct automated sequencing of multi-card threads remains highly restricted for basic and non-premium API accounts. Ensure your profile has the correct subscription tier for high-frequency threads.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#d75a34] font-bold">•</span>
                  <span>
                    <strong className="text-foreground">Instagram Auto-publishing:</strong> Only supports direct auto-publishing of feed carousels, standard images, or reels when connected via a verified Meta Business Suite profile. Personal or Standard Creator profiles require manual mobile push notifications.
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
              Before integrating a software queue to manage your career branding or executive clients, verify the calendar editor and composer mechanics.
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
              Don't get hit with scaling pricing models that penalize your growth. Choose a flat tier based on your active channels and team needs.
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
              <Link to="/social-media-tool-for-saas-founders" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
                For SaaS founders
              </Link>
              <Link to="/social-media-tool-for-agencies" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
                For marketing agencies
              </Link>
            </div>
          </section>
        </main>
      </section>

      <Footer />
    </div>
  );
}
