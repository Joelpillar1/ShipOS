// Shared helpers for the Dodo Payments edge functions (dodo-checkout, dodo-webhook,
// dodo-portal). Keeps the provider base URL, auth, product↔plan mapping, and the Supabase
// clients in one place.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// test_mode → test host, anything else → live host.
export function dodoBaseUrl(): string {
  const env = (Deno.env.get("DODO_ENVIRONMENT") || "test_mode").toLowerCase();
  return env === "live_mode" || env === "live"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";
}

// Authenticated call to the Dodo REST API. Returns the parsed JSON plus the raw response so
// callers can log/inspect on failure (Dodo field names vary across versions).
export async function dodoFetch(path: string, init: RequestInit = {}) {
  const apiKey = Deno.env.get("DODO_API_KEY") || "";
  if (!apiKey) throw new Error("DODO_API_KEY is not set");

  const res = await fetch(`${dodoBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

export type Plan = "Starter" | "Creator" | "Pro";
export type Cycle = "monthly" | "annual" | "lifetime";

const PLANS: Plan[] = ["Starter", "Creator", "Pro"];
const CYCLES: Cycle[] = ["monthly", "annual", "lifetime"];

// Resolve the Dodo product id for a (plan, cycle) from env, e.g. DODO_PRODUCT_CREATOR_MONTHLY.
export function productIdFor(plan: Plan, cycle: Cycle): string | null {
  if (plan === "Pro" && cycle === "lifetime") {
    return Deno.env.get("DODO_PRODUCT_LIFETIME_ACCESS") || null;
  }
  const key = `DODO_PRODUCT_${plan.toUpperCase()}_${cycle.toUpperCase()}`;
  return Deno.env.get(key) || null;
}

// Reverse lookup: Dodo product id → plan. Used by the webhook when metadata is absent.
export function planForProduct(productId: string): Plan | null {
  if (productId && productId === Deno.env.get("DODO_PRODUCT_LIFETIME_ACCESS")) {
    return "Pro";
  }
  for (const plan of PLANS) {
    for (const cycle of CYCLES) {
      if (productIdFor(plan, cycle) === productId) return plan;
    }
  }
  return null;
}

// Normalize an email to a stable "mailbox identity" used to detect repeat free-trial signups
// across different accounts (trial farming). We collapse the variations that all deliver to the
// same inbox:
//   * lowercase + trim
//   * strip "+tag" sub-addressing (Gmail and many providers)
//   * for Gmail/Googlemail, remove dots in the local part and treat googlemail.com as gmail.com
// Returns null for anything that isn't a plausible address. Conservative on purpose — it only
// folds widely-supported aliasing so two genuinely different people are never collapsed together.
export function normalizeTrialEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const e = email.trim().toLowerCase();
  const at = e.lastIndexOf("@");
  if (at <= 0 || at === e.length - 1) return null;
  let local = e.slice(0, at);
  let domain = e.slice(at + 1);

  const plus = local.indexOf("+");
  if (plus >= 0) local = local.slice(0, plus);

  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.replace(/\./g, "");

  if (!local || !domain.includes(".")) return null;
  return `${local}@${domain}`;
}

export function isPlan(v: unknown): v is Plan {
  return typeof v === "string" && (PLANS as string[]).includes(v);
}

export function isCycle(v: unknown): v is Cycle {
  return typeof v === "string" && (CYCLES as string[]).includes(v);
}

// Service-role client: bypasses the profile column-protection trigger so the webhook can grant
// paid plans via admin_apply_subscription.
export function adminClient() {
  const url = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!url || !serviceKey) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Resolve the signed-in user from the request's Authorization bearer token (the user's JWT).
export async function getAuthedUser(req: Request) {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const url = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  if (!url || !anonKey) return null;
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}
