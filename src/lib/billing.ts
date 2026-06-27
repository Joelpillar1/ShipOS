import { supabase } from "./supabase";
import { setUserPlan } from "./postStorage";

export type Plan = "Starter" | "Creator" | "Pro";
export type BillingCycle = "monthly" | "annual" | "lifetime";

// ── Pending signup discount (spin-the-wheel → /claim-discount) ───────────────────
// The discount is chosen before the user has an account, so we stash the percentage in
// localStorage and apply it on the next checkout. The server maps the percentage to a real
// Dodo discount code (env-gated), so this value is only a hint — a tampered number can't grant
// an unconfigured discount.
const PENDING_DISCOUNT_KEY = "shipos_pending_discount";

export function setPendingDiscount(percent: number): void {
  try {
    if (Number.isFinite(percent) && percent > 0) {
      localStorage.setItem(PENDING_DISCOUNT_KEY, String(Math.floor(percent)));
    }
  } catch {
    /* ignore */
  }
}

export function getPendingDiscount(): number {
  try {
    const v = parseInt(localStorage.getItem(PENDING_DISCOUNT_KEY) || "", 10);
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}

export function clearPendingDiscount(): void {
  try {
    localStorage.removeItem(PENDING_DISCOUNT_KEY);
  } catch {
    /* ignore */
  }
}

// ── Pending checkout intent (for "Retry payment") ────────────────────────────────
// The plan/cycle the user is checking out is stashed before we redirect to Dodo, so the
// post-checkout page (/billing/success) can offer a one-click "Retry payment" for the SAME plan
// if the card was never accepted — without making the user walk back through the plan picker.
const PENDING_CHECKOUT_KEY = "shipos_pending_checkout";

export function setPendingCheckout(intent: { plan: Plan; cycle: BillingCycle }): void {
  try {
    localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(intent));
  } catch {
    /* ignore */
  }
}

export function getPendingCheckout(): { plan: Plan; cycle: BillingCycle } | null {
  try {
    const raw = localStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      (parsed?.plan === "Starter" || parsed?.plan === "Creator" || parsed?.plan === "Pro") &&
      (parsed?.cycle === "monthly" || parsed?.cycle === "annual" || parsed?.cycle === "lifetime")
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPendingCheckout(): void {
  try {
    localStorage.removeItem(PENDING_CHECKOUT_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Start a Dodo Payments subscription checkout for the given plan + billing cycle.
 *
 * Real mode: calls the dodo-checkout edge function, which creates a subscription (with a 7-day
 * trial) and returns the hosted checkout URL; we redirect the browser there. The user's plan is
 * NOT granted here — only the verified Dodo webhook grants it after payment/trial start.
 *
 * Mock/demo mode (no Supabase configured): there is no payment provider, so we just grant the
 * plan locally so the demo UI reflects the choice, and signal the caller to continue in-app.
 *
 * Returns { redirected: true } when the browser is being sent to checkout, or
 * { mockGranted: true } in demo mode. Throws on failure so callers can show a toast.
 */
export async function startCheckout(
  plan: Plan,
  cycle: BillingCycle,
): Promise<{ redirected?: boolean; mockGranted?: boolean; alreadySubscribed?: boolean }> {
  if (!supabase) {
    await setUserPlan(plan);
    clearPendingDiscount();
    return { mockGranted: true };
  }

  // Carry any spin-the-wheel discount the user claimed before signing up into checkout.
  const discountPercent = getPendingDiscount();
  const { data, error } = await supabase.functions.invoke("dodo-checkout", {
    body: { plan, cycle, ...(discountPercent ? { discountPercent } : {}) },
  });

  if (error) {
    // dodo-checkout returns 409 { alreadySubscribed: true } when the user already has a live
    // subscription. Supabase surfaces non-2xx as a FunctionsHttpError with the JSON body on
    // `error.context`; pull it out so the caller can route to changePlan instead of checkout.
    try {
      const ctx = (error as any)?.context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.alreadySubscribed) {
          return { alreadySubscribed: true };
        }
        if (body?.error) {
          console.error("Supabase edge function error:", body);
          throw new Error(body.error + (body.detail ? ` Details: ${JSON.stringify(body.detail)}` : ""));
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message) throw e;
    }
    throw new Error(error.message || "Could not start checkout.");
  }
  const url: string | undefined = data?.url;
  if (!url) {
    throw new Error(data?.error || "Checkout URL was not returned.");
  }

  // Remember what we're checking out so /billing/success can offer a one-click retry of the SAME
  // plan if the card isn't accepted. Cleared once the subscription is confirmed.
  setPendingCheckout({ plan, cycle });
  window.location.href = url;
  return { redirected: true };
}

/**
 * Preview the plan change details (prorated amount, next billing date/amount)
 * before actually executing the plan change.
 */
export async function previewChangePlan(
  plan: Plan,
  cycle: BillingCycle,
): Promise<{
  needsCheckout?: boolean;
  immediateCharge?: number;
  nextBillingDate?: string | null;
  nextBillingAmount?: number;
  isDowngrade?: boolean;
  isTrialing?: boolean;
}> {
  if (!supabase) {
    // Mock preview for demo mode
    return {
      needsCheckout: false,
      immediateCharge: plan === "Pro" ? 19.35 : 6.45,
      nextBillingDate: "2025-07-01",
      nextBillingAmount: plan === "Pro" ? 49.00 : 29.00,
      isDowngrade: false,
      isTrialing: false,
    };
  }

  const { data, error } = await supabase.functions.invoke("dodo-change-plan", {
    body: { plan, cycle, preview: true },
  });

  if (error) {
    // Try to extract the richer error detail the edge function embeds in the response body.
    try {
      const ctx = (error as any)?.context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) throw new Error(`${body.error}${body.detail ? ` — Dodo: ${JSON.stringify(body.detail)}` : ""}`);
      }
    } catch (e) {
      if (e instanceof Error && e.message) throw e;
    }
    throw new Error(error.message || "Could not calculate prorated preview.");
  }
  if (data?.error) {
    throw new Error(`${data.error}${data.detail ? ` — Dodo: ${JSON.stringify(data.detail)}` : ""}`);
  }

  return data;
}

/**
 * Change the plan/billing cycle of the user's EXISTING subscription (upgrade or downgrade) with
 * proration, instead of starting a new subscription. Use this when the user is already on a paid
 * plan so they are not double-billed and do not get a fresh trial.
 *
 * Real mode: calls the dodo-change-plan edge function. If the user has no modifiable subscription
 * (e.g. their plan was cancelled), the function returns { needsCheckout: true } and we transparently
 * fall back to startCheckout, which creates a new subscription. The plan is applied by the verified
 * Dodo webhook, so on success the caller should refresh the profile shortly after.
 *
 * Mock/demo mode: there is no provider, so we grant the plan locally (same as startCheckout).
 *
 * Returns { changed: true } when the existing subscription was updated, or the result of
 * startCheckout when a new subscription was needed. Throws on failure so callers can show a toast.
 */
export async function changePlan(
  plan: Plan,
  cycle: BillingCycle,
): Promise<{ changed?: boolean; redirected?: boolean; mockGranted?: boolean; alreadySubscribed?: boolean }> {
  if (!supabase) {
    await setUserPlan(plan);
    return { mockGranted: true };
  }

  const { data, error } = await supabase.functions.invoke("dodo-change-plan", {
    body: { plan, cycle },
  });

  if (error) {
    // Try to extract the richer error detail the edge function embeds in the response body.
    try {
      const ctx = (error as any)?.context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) throw new Error(`${body.error}${body.detail ? ` — Dodo: ${JSON.stringify(body.detail)}` : ""}`);
      }
    } catch (e) {
      if (e instanceof Error && e.message) throw e;
    }
    throw new Error(error.message || "Could not change your plan.");
  }
  if (data?.error) {
    throw new Error(`${data.error}${data.detail ? ` — Dodo: ${JSON.stringify(data.detail)}` : ""}`);
  }
  // No existing subscription to modify — create a new one via the normal checkout flow.
  if (data?.needsCheckout) {
    return startCheckout(plan, cycle);
  }

  return { changed: true };
}

/**
 * Open the Dodo hosted customer portal (update card, view invoices, cancel) by redirecting the
 * browser to a freshly created portal session. Throws on failure.
 */
export async function openBillingPortal(): Promise<void> {
  if (!supabase) {
    throw new Error("Billing management isn't available in demo mode.");
  }

  const { data, error } = await supabase.functions.invoke("dodo-portal", {
    body: {},
  });

  if (error) {
    throw new Error(error.message || "Could not open the billing portal.");
  }
  const url: string | undefined = data?.url;
  if (!url) {
    throw new Error(data?.error || "Billing portal URL was not returned.");
  }

  window.location.href = url;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  invoiceUrl: string | null;
}

export interface CardDetails {
  last4: string;
  network: string;
  holder: string;
}

/**
 * Fetch billing history and card details from Dodo Payments.
 */
export async function fetchBillingHistory(): Promise<{ card: CardDetails | null; history: Invoice[] }> {
  if (!supabase) {
    // Return mock billing data in demo mode
    return {
      card: {
        last4: "4242",
        network: "VISA",
        holder: "John Doe"
      },
      history: [
        {
          id: "pay_mock_1",
          amount: 19.00,
          currency: "USD",
          status: "succeeded",
          date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
          invoiceUrl: "#"
        },
        {
          id: "pay_mock_2",
          amount: 19.00,
          currency: "USD",
          status: "succeeded",
          date: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
          invoiceUrl: "#"
        }
      ]
    };
  }

  const { data, error } = await supabase.functions.invoke("dodo-billing-history", {
    body: {},
  });

  if (error) {
    throw new Error(error.message || "Could not fetch billing details.");
  }
  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    card: data?.card || null,
    history: data?.history || [],
  };
}
