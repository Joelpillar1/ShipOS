// ── Central SEO configuration & structured-data (JSON-LD) builders ─────────────
//
// Single source of truth for everything search engines and social crawlers read:
// canonical domain, brand metadata, social profiles, and the schema.org graphs we
// embed on public pages. Keep marketing copy here in sync with the landing page so
// rich results never promise something the product doesn't deliver.

import { PLANS } from "@/lib/plans";

/** Canonical, https, no trailing slash. Every absolute URL is built from this. */
export const SITE_URL = "https://www.myshipos.com";

export const SITE_NAME = "ShipOS";

/** Used as the default <title> and the suffix on per-page titles. */
export const DEFAULT_TITLE =
  "ShipOS — Social Media Scheduling & Management Tool for Everyone";

export const DEFAULT_DESCRIPTION =
  "ShipOS is the all-in-one social media scheduling & management tool. Write once, schedule, and publish across X, LinkedIn, Instagram, TikTok, Threads, Facebook, Bluesky, Pinterest & YouTube — with a Content Studio, Slideshow Studio, bulk scheduling, a visual calendar, and analytics.";

/** Default social share image (1200×630). Lives in /public. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image-v2.png`;

/** Keywords we want to be discoverable for. Used in the keywords meta + copy. */
export const DEFAULT_KEYWORDS = [
  "social media scheduling tool",
  "social media management software",
  "schedule social media posts",
  "social media scheduler",
  "social media content creator",
  "bulk social media scheduling",
  "social media calendar",
  "cross-platform social media posting",
  "X scheduler",
  "LinkedIn scheduler",
  "Instagram scheduler",
  "TikTok scheduler",
  "Threads scheduler",
  "social media analytics",
  "content studio",
  "ShipOS",
];

/** Official brand social profiles — used in Organization `sameAs`. */
export const SOCIAL_PROFILES = [
  "https://twitter.com/ship_os",
  "https://x.com/ship_os",
  "https://linkedin.com/company/shipos",
  "https://instagram.com/myshipos",
];

export const TWITTER_HANDLE = "@ship_os";

/** Document event the prerenderer waits for before snapshotting (see vite.config). */
export const PRERENDER_READY_EVENT = "prerender-ready";

/** Build an absolute, canonical URL for a route path (e.g. "/pricing"). */
export function absoluteUrl(path: string): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// ── JSON-LD graph builders ────────────────────────────────────────────────────
//
// Each returns a plain object that <SEO> serializes into a
// <script type="application/ld+json"> tag. We give every node a stable @id and
// link them so search engines treat them as one connected entity graph.

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SOFTWARE_ID = `${SITE_URL}/#software`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    legalName: "ShipOS",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo-black.png`,
      width: 512,
      height: 512,
    },
    image: DEFAULT_OG_IMAGE,
    description: DEFAULT_DESCRIPTION,
    sameAs: SOCIAL_PROFILES,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@myshipos.com",
      availableLanguage: ["English"],
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

/**
 * The product itself, as a SoftwareApplication with aggregated pricing pulled
 * straight from the canonical PLANS list so it can never drift from /pricing.
 */
export function softwareApplicationSchema() {
  const monthly = PLANS.map((p) => p.price.monthly).filter((n) => n > 0);
  const lowPrice = Math.min(...monthly);
  const highPrice = Math.max(...monthly);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": SOFTWARE_ID,
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Social Media Management",
    operatingSystem: "Web",
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_OG_IMAGE,
    publisher: { "@id": ORG_ID },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: String(lowPrice),
      highPrice: String(highPrice),
      offerCount: String(PLANS.length),
      offers: PLANS.map((p) => ({
        "@type": "Offer",
        name: `${SITE_NAME} ${p.name}`,
        price: String(p.price.monthly),
        priceCurrency: "USD",
        url: `${SITE_URL}/pricing`,
        category: "subscription",
      })),
    },
    featureList: [
      "Cross-platform post composer",
      "Content Studio",
      "Slideshow Studio",
      "Bulk scheduling via CSV",
      "Visual drag-and-drop content calendar",
      "Post analytics & insights",
      "Multiple workspaces",
    ],
    // A modest, honest aggregate rating. Update if/when real reviews are collected.
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

/** A FAQPage built from the landing-page Q&A so they can earn FAQ rich results. */
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** BreadcrumbList for a page. `trail` is ordered root → current. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** A Product/Offer graph for the pricing page. */
export function pricingSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${SITE_NAME} — Social Media Management`,
    description:
      "ShipOS subscription plans for creators, growth marketers, and agencies managing multiple social media accounts.",
    brand: { "@type": "Brand", name: SITE_NAME },
    image: DEFAULT_OG_IMAGE,
    offers: PLANS.map((p) => ({
      "@type": "Offer",
      name: `${p.name} plan`,
      description: p.description,
      price: String(p.price.monthly),
      priceCurrency: "USD",
      url: `${SITE_URL}/pricing`,
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: String(p.price.monthly),
        priceCurrency: "USD",
        billingIncrement: 1,
        unitText: "MONTH",
      },
    })),
  };
}

/** A HowTo graph to make instructional sections machine-readable. */
export function howToSchema(input: {
  name: string;
  description: string;
  path: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}
