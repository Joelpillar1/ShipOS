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
  DollarSign,
  Calendar,
  Layers3,
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
    question: "Is ShipOS really cheaper than Buffer?",
    answer:
      "Yes, for almost all use cases except solo creators with 1 to 2 accounts. Because Buffer charges a linear rate of $6 to $12 per connected channel each month, managing 15 profiles on a team plan runs about $180/mo on Buffer. ShipOS offers a flat $29/mo Creator plan for 15 connected social accounts, representing over 80% savings.",
  },
  {
    question: "Can I migrate my scheduled queue from Buffer to ShipOS?",
    answer:
      "Yes. While direct API import is restricted by Buffer's API terms, you can export your scheduled queue or drafts from Buffer and import them directly into ShipOS using our native Bulk Scheduler (supporting CSV, TSV, and Text files) in seconds.",
  },
  {
    question: "Does ShipOS support the same social media platforms?",
    answer:
      "ShipOS supports X (Twitter), LinkedIn, Instagram, TikTok, Threads, Facebook, Bluesky, Pinterest, and YouTube. Buffer supports 9 platforms as well, including Mastodon but excluding Bluesky. With ShipOS, you gain native Bluesky support which is essential for tech, media, and web3 creators.",
  },
  {
    question: "Is OAuth connection safe and compliant?",
    answer:
      "Absolutely. ShipOS utilizes secure, official OAuth 2.0 integrations provided directly by the platforms. We never store or request your social media passwords, and you can instantly revoke access at any time from your settings or directly from the respective social networks.",
  },
  {
    question: "What is the Slideshow Studio and how does it compare to Buffer?",
    answer:
      "The ShipOS Slideshow Studio is a built-in carousel editor that allows you to draft, design, and automatically split visual slides and carousels for LinkedIn and Instagram. Buffer does not have a native carousel builder—you have to design them in Canva, download them, and manually upload each slide.",
  },
];

const menuItems = [
  { id: "philosophy-comparison", label: "1. Core Philosophy" },
  { id: "pricing-math", label: "2. Cost & Pricing Math" },
  { id: "slideshow-studio", label: "3. Slideshow Studio" },
  { id: "bulk-scheduler", label: "4. Bulk Ingestion" },
  { id: "comparison-matrix", label: "5. Feature Matrix" },
  { id: "migration-guide", label: "6. Migration Steps" },
  { id: "demo-walkthrough", label: "7. Video Walkthrough" },
  { id: "pricing-plans", label: "8. Plans & Pricing" },
  { id: "operational-faqs", label: "9. Decision FAQs" },
];

export default function CompareBuffer() {
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
        title="ShipOS vs Buffer Comparison — Best Flat-Rate Social Media Scheduler"
        description="Factual side-by-side comparison between Buffer and ShipOS. Compare flat-rate pricing models vs per-profile taxes, native slideshow builders, bulk upload, and advanced AI studio."
        path="/compare/buffer"
        type="article"
        keywords={["ShipOS vs Buffer", "Buffer alternative", "flat rate social media scheduler", "bulk scheduling tool", "slideshow studio creator"]}
        jsonLd={[
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare Buffer", path: "/compare/buffer" },
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
            Every new account you add <br />
            <span className="text-[#d75a34]">costs you more on Buffer.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Buffer charges per connected social channel—so your bill scales every time you grow. ShipOS uses simple, predictable flat subscription tiers. Add 10 more accounts and pay the exact same cost.
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
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Operational Cost</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Agencies with dozens of connected accounts pay excessive linear profile taxes on Buffer. Flat monthly subscriptions end this growth penalty.
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
                Buffer is an industry pioneer, established originally to help users schedule text and image posts in linear queues. It remains highly popular for solo creators managing a small handful of social channels.
              </p>
              <p>
                However, Buffer’s pricing and creative architecture have not evolved with modern multi-platform and team-scale requirements. As you scale, Buffer bills you linearly per added social channel.
              </p>
              <p>
                <strong className="text-foreground">ShipOS</strong> introduces a flat-rate operational architecture. It acts as an integrated command center built specifically to eliminate linear channel taxes, provide native carousel design studio layers, and ingest bulk content spreadsheet uploads in seconds.
              </p>
        </div>
      </section>

          {/* Section 2: Cost & Pricing Math */}
          <section id="pricing-math" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">2.</span> Factual Cost and Pricing Math
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                Buffer prices its plans at <strong className="text-foreground">$6 to $12 per connected channel each month</strong>. For a brand managing 3 profiles (e.g., LinkedIn, X, and Instagram), this appears affordable.
              </p>
              <p>
                But for growing startups, personal brands, and marketing agencies, the linear pricing scale quickly balloons into a significant penalty. If you manage 3 client brands across X, LinkedIn, Instagram, TikTok, and Facebook, you have <strong className="text-foreground">15 social channels</strong>.
              </p>
              <p>
                Let’s compare the actual numbers side-by-side to understand the compound cost differences:
              </p>
              
              <div className="overflow-x-auto border border-border mt-4">
                <table className="w-full text-left text-xs border-collapse">
              <thead>
                    <tr className="bg-muted border-b border-border font-bold text-foreground">
                      <th className="p-3">Connected Profiles</th>
                      <th className="p-3">Buffer Team Plan Cost ($12/profile)</th>
                      <th className="p-3">ShipOS Flat Rate Subscription</th>
                      <th className="p-3">Total Monthly Savings</th>
                </tr>
              </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { accounts: "5 Accounts", buffer: "$60 / month", shipos: "$19 / month (Starter plan)", savings: "$41 / mo ($492/yr)" },
                      { accounts: "15 Accounts", buffer: "$180 / month", shipos: "$29 / month (Creator plan)", savings: "$151 / mo ($1,812/yr)" },
                      { accounts: "40 Accounts", buffer: "$480 / month", shipos: "$49 / month (Pro plan)", savings: "$431 / mo ($5,172/yr)" },
                      { accounts: "100 Accounts", buffer: "$1,200 / month", shipos: "$49 / month (Pro plan - Unlimited)", savings: "$1,151 / mo ($13,812/yr)" },
                    ].map((row) => (
                      <tr key={row.accounts}>
                        <td className="p-3 font-bold text-foreground">{row.accounts}</td>
                        <td className="p-3 text-red-600 font-bold">{row.buffer}</td>
                        <td className="p-3 text-green-600 font-bold">{row.shipos}</td>
                        <td className="p-3 font-bold text-foreground bg-green-500/5">{row.savings}</td>
                </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

          {/* Section 3: Slideshow Studio */}
          <section id="slideshow-studio" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">3.</span> Built-In Slideshow & Carousel Studio
          </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                Visual multi-image carousels are mathematically proven to drive some of the highest engagement rates on LinkedIn and Instagram.
              </p>
              <p>
                Buffer does not feature a native carousel design layer. To publish a carousel, you must design it in third-party software like Canva, export each slide as an image file to your device, and manually upload them card-by-card in the publisher tab.
              </p>
              <p>
                ShipOS features a fully integrated <strong className="text-foreground">Slideshow Studio</strong>. You can draft copy, arrange slide sequences, write individual slide subtitles, design templates, and schedule multi-slide carousels natively in one interface. This eliminates tab-switching and file download clutter.
              </p>
          </div>
          </section>

          {/* Section 4: Bulk Ingestion */}
          <section id="bulk-scheduler" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <span className="text-[#d75a34]">4.</span> Native CSV Bulk Ingestion
          </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                For teams scheduling full monthly campaigns, publishing items one-by-one is highly inefficient.
              </p>
              <p>
                Buffer forces you to create every scheduled post manually inside their browser composer window. There is no native spreadsheet queue parser to upload pre-drafted posts in batches.
              </p>
              <p>
                ShipOS includes a powerful, native <strong className="text-foreground">Bulk File Scheduler</strong>. You can prepare up to 50 posts at once inside a standard CSV, TSV, or plain text document (specifying dates, captions, links, and assets). Drag the file into the uploader, resolve any formatting issues via the real-time validator, and queue your entire monthly calendar in seconds.
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
                    <th className="p-3 text-center">Buffer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {[
                    { f: "Subscription Model", s: "Predictable Flat Rates", p: "Linear Profile Tax" },
                    { f: "Native Slideshow & Carousel Creator", s: "Yes (Built-In Studio)", p: "No (Manual canvas uploading)" },
                    { f: "Bulk CSV / Spreadsheet Ingestion", s: "Yes (Live validation parsing)", p: "No (Must input one-by-one)" },
                    { f: "Secure Multi-Brand Workspaces", s: "Yes (Database-isolated sandboxes)", p: "No (Linear account mixing)" },
                    { f: "Active Bluesky Channel API", s: "Yes (Direct OAuth publishing)", p: "No" },
                    { f: "Dedicated Campaign UTM Ingestion", s: "Yes", p: "Basic links" },
                    { f: "AI Content Studio Credits", s: "100 / 400 / Unlimited Tiers", p: "Requires paid add-on" },
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
                Transferring your schedule from Buffer to ShipOS is simple and requires zero downtime for your active channels:
              </p>
              <div className="border border-border bg-card divide-y divide-border">
                {[
                  { step: "01 — Export Buffer Queue", text: "Download your queued posts as a standard CSV file directly from your Buffer settings page." },
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
              <Link to="/compare/later" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
                ShipOS vs Later
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
