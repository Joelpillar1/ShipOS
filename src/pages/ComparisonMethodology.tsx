import { Link } from "react-router-dom";
import { CheckCircle2, FileCheck2, Scale, ShieldCheck, TableProperties } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { breadcrumbSchema, faqSchema, howToSchema, softwareApplicationSchema } from "@/lib/seo";

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

const criteria = [
  "Pricing model (flat-tier vs per-channel/seat)",
  "Supported platforms and post-type coverage",
  "Calendar planning and scheduling workflow",
  "Bulk scheduling support and import formats",
  "Approval flow and collaboration capabilities",
  "Content creation and AI support",
  "Media workflow support (for example carousel preparation)",
  "Analytics/reporting depth available in-product",
  "Workspace/client separation capabilities",
  "Migration effort and operational friction",
];

const faqs = [
  {
    question: "Why publish comparison methodology?",
    answer:
      "A methodology page explains how comparison conclusions are produced. It reduces bias and helps readers audit criteria and assumptions.",
  },
  {
    question: "How often should comparisons be reviewed?",
    answer:
      "Comparisons should be reviewed whenever pricing, platform coverage, or major features change, and on a regular cadence to avoid stale claims.",
  },
  {
    question: "Does this page claim competitor data is always current?",
    answer:
      "No. This page defines process, criteria, and evidence standards. Individual comparison pages should include update dates and source references.",
  },
];

export default function ComparisonMethodology() {
  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="ShipOS Comparison Methodology"
        description="How ShipOS structures product comparisons: criteria, evidence standards, update cadence, and boundaries to avoid misleading claims."
        path="/shipos-vs-alternatives-methodology"
        type="article"
        keywords={[
          "saas comparison methodology",
          "software comparison framework",
          "shipos comparison methodology",
          "how product comparisons are evaluated",
        ]}
        jsonLd={[
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Comparison Methodology", path: "/shipos-vs-alternatives-methodology" },
          ]),
          faqSchema(faqs),
          howToSchema({
            name: "How to evaluate social media scheduling tools fairly",
            description:
              "Use clear criteria, current evidence, and explicit assumptions when writing software comparisons.",
            path: "/shipos-vs-alternatives-methodology",
            steps: [
              {
                name: "Define criteria",
                text: "Use a fixed, explicit criteria set before writing conclusions.",
              },
              {
                name: "Collect evidence",
                text: "Use vendor docs, pricing pages, and in-product verification where possible.",
              },
              {
                name: "Publish assumptions and boundaries",
                text: "State update dates, limits, and what is not being claimed.",
              },
            ],
          }),
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-16">
        <section className="max-w-6xl mx-auto px-6 text-center mb-14">
          <SectionBadge label="Methodology" text="Transparent comparison framework" mobileText="Comparison framework" />
          <h1 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            ShipOS Comparison Methodology
          </h1>
          <p className="mt-5 text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            This page defines how ShipOS comparison pages are built so readers can see what is measured,
            where evidence comes from, and what is intentionally not claimed.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16 grid md:grid-cols-3 gap-5">
          <div className="border border-border bg-card p-6 space-y-3">
            <Scale className="w-5 h-5 text-[#d75a34]" />
            <h2 className="text-lg font-bold">Consistent criteria</h2>
            <p className="text-sm text-muted-foreground">
              Every comparison should use the same decision criteria before conclusions are written.
            </p>
          </div>
          <div className="border border-border bg-card p-6 space-y-3">
            <FileCheck2 className="w-5 h-5 text-[#d75a34]" />
            <h2 className="text-lg font-bold">Evidence-first writing</h2>
            <p className="text-sm text-muted-foreground">
              Claims should map to a source or verifiable product behavior, not marketing language alone.
            </p>
          </div>
          <div className="border border-border bg-card p-6 space-y-3">
            <ShieldCheck className="w-5 h-5 text-[#d75a34]" />
            <h2 className="text-lg font-bold">No overpromising</h2>
            <p className="text-sm text-muted-foreground">
              Comparison pages should avoid guarantees about outcomes and clearly state assumptions.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Core comparison criteria</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-3">
            {criteria.map((item) => (
              <div key={item} className="border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Evidence standards</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border bg-card p-5">
              <p className="text-xs font-bold tracking-wider text-[#d75a34] uppercase">Required</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-[#d75a34]" /> Use current public pricing references for cost examples.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-[#d75a34]" /> Distinguish between included features and add-ons.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-[#d75a34]" /> Separate factual table rows from interpretation text.</li>
              </ul>
            </div>
            <div className="border border-border bg-card p-5">
              <p className="text-xs font-bold tracking-wider text-[#d75a34] uppercase">Boundaries</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-2"><TableProperties className="w-4 h-4 mt-0.5 text-[#d75a34]" /> Avoid absolute claims like "best for everyone."</li>
                <li className="flex items-start gap-2"><TableProperties className="w-4 h-4 mt-0.5 text-[#d75a34]" /> Avoid guarantees for growth, impressions, or revenue outcomes.</li>
                <li className="flex items-start gap-2"><TableProperties className="w-4 h-4 mt-0.5 text-[#d75a34]" /> Include update cadence and state that features can change over time.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Update cadence</h2>
          <div className="border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Comparison pages should be reviewed on a recurring schedule and after major pricing or
              feature updates from either side. If source data changes, comparisons should be revised
              before adding stronger claims.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Reader safeguards</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border bg-card p-5">
              <h3 className="text-base font-bold text-foreground">How to read comparisons</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Treat comparison pages as decision support, not guarantees. Final tool choice should be
                validated against current vendor documentation and your actual workflow requirements.
              </p>
            </div>
            <div className="border border-border bg-card p-5">
              <h3 className="text-base font-bold text-foreground">What these pages do not claim</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                They do not claim permanent pricing accuracy, guaranteed growth outcomes, or universal
                "best tool" conclusions for every team size and use case.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 mb-16">
          <h2 className="text-2xl font-black text-foreground mb-6">Frequently asked questions</h2>
          <div className="divide-y divide-border border-y border-border">
            {faqs.map((faq, i) => (
              <div key={faq.question} className="py-4">
                <p className="font-bold text-foreground">{faq.question}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6">
          <h2 className="text-xl font-black text-foreground mb-4">Related pages</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <Link to="/compare/buffer" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              ShipOS vs Buffer
            </Link>
            <Link to="/compare/hootsuite" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              ShipOS vs Hootsuite
            </Link>
            <Link to="/ai-social-media-scheduler" className="border border-border bg-card p-4 hover:border-[#d75a34]/50">
              AI social media scheduler
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
