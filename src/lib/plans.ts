// ── Single source of truth for subscription plans ─────────────────────────────────
//
// Every pricing surface (landing PricingSection, /pricing, /claim-discount, Settings → Plans)
// MUST read from here so they can never drift apart on price, AI-credit counts, or limits.
//
// These numbers mirror the SERVER-AUTHORITATIVE allowances enforced in the database. Keep them
// in sync with the migrations — if you change a value here, change it there (and vice-versa),
// otherwise the marketing copy promises something the backend won't grant:
//   * AI credits  → plan_allowance()  (20260608170000_enforce_ai_credits.sql):
//                     Starter 100 · Creator 400 · Pro unlimited
//   * Limits      → profile_limits    (20260612150000_profile_limits.sql):
//                     workspaces  1 / 5 / ∞
//                     connections 5 / 15 / ∞
//                     monthly posts 200 / ∞ / ∞
//                     bulk posts 10 / 25 / 50
//                     slideshow slides 0 / 5 / 10
//
// Prices are the product list prices configured in Dodo Payments.

export type PlanName = "Starter" | "Creator" | "Pro";

export interface PlanLimits {
  /** Use Infinity for "unlimited". */
  workspaces: number;
  connections: number;
  monthlyPosts: number;
  bulkPosts: number;
  slideshowSlides: number;
  aiCredits: number;
}

export interface PlanDefinition {
  name: PlanName;
  price: { monthly: number; annual: number };
  description: string;
  /** Canonical, customer-facing feature list. Used verbatim by every pricing surface. */
  features: string[];
  /** Machine-readable limits (kept consistent with the feature copy above). */
  limits: PlanLimits;
  popular?: boolean;
  badge?: string;
}

export const PLANS: PlanDefinition[] = [
  {
    name: "Starter",
    price: { monthly: 19, annual: 190 },
    description: "Perfect for single creators starting out",
    features: [
      "1 Workspace",
      "5 Connected Social Accounts",
      "200 Posts per month",
      "Schedule Posts",
      "Studio Access (100 AI Credits)",
      "Bulk Scheduling (10 posts at once)",
      "Basic support",
    ],
    limits: {
      workspaces: 1,
      connections: 5,
      monthlyPosts: 200,
      bulkPosts: 10,
      slideshowSlides: 0,
      aiCredits: 100,
    },
  },
  {
    name: "Creator",
    price: { monthly: 29, annual: 290 },
    description: "The sweet spot for active growth hackers",
    features: [
      "5 Workspaces",
      "15 Connected Social Accounts",
      "Unlimited Posts per month",
      "Multiple accounts per platform",
      "Unlimited Schedule Posts",
      "Slideshow Studio (5 slides/slideshow)",
      "Studio Access (400 AI Credits)",
      "Bulk Scheduling (25 posts at once)",
      "Full Analytics & Insight",
      "Advanced Scheduling & Automation",
      "Priority Support",
    ],
    limits: {
      workspaces: 5,
      connections: 15,
      monthlyPosts: Infinity,
      bulkPosts: 25,
      slideshowSlides: 5,
      aiCredits: 400,
    },
    popular: true,
    badge: "Most Popular",
  },
  {
    name: "Pro",
    price: { monthly: 49, annual: 490 },
    description: "For digital agencies and media networks",
    features: [
      "Unlimited Workspaces",
      "Unlimited Connected Social Accounts",
      "Unlimited Posts per month",
      "Multiple accounts per platform",
      "Unlimited Schedule Posts",
      "Slideshow Studio (10 slides/slideshow)",
      "Unlimited Studio Access",
      "Bulk Scheduling (50 posts at once)",
      "Full Analytics & Insight",
      "Advanced Scheduling & Automation",
      "Priority Human Support",
    ],
    limits: {
      workspaces: Infinity,
      connections: Infinity,
      monthlyPosts: Infinity,
      bulkPosts: 50,
      slideshowSlides: 10,
      aiCredits: Infinity,
    },
    badge: "Best Value",
  },
];

export const PLAN_BY_NAME: Record<PlanName, PlanDefinition> = PLANS.reduce(
  (acc, p) => {
    acc[p.name] = p;
    return acc;
  },
  {} as Record<PlanName, PlanDefinition>,
);
