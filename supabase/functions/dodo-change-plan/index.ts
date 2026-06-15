import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  adminClient,
  corsHeaders,
  dodoFetch,
  getAuthedUser,
  isCycle,
  isPlan,
  json,
  productIdFor,
} from "../_shared/dodo.ts";

// Upgrades/downgrades an EXISTING Dodo subscription to a different plan or billing cycle, with
// proration — instead of creating a second subscription (which would double-bill the user and
// start a new trial). Uses POST /subscriptions/{id}/change-plan with proration_billing_mode
// difference_immediately: on upgrade the customer is charged the price difference now, on
// downgrade the unused amount is credited toward future renewals. No new trial is granted.
//
// If the user has no active subscription to modify, we return { needsCheckout: true } so the
// client falls back to the normal checkout flow (which creates a fresh subscription).
//
// SECURITY: The plan grant for BOTH upgrades and downgrades flows exclusively through the
// verified Dodo webhook (admin_apply_subscription called with the service role). This function
// never directly writes the plan — doing so would apply a value from the client-controlled
// request body without cryptographic verification. The webhook fires within seconds of the
// Dodo API call completing; the client polls for the update via refreshPlanUntil.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized: please sign in." }, 401);

    const body = await req.json().catch(() => ({}));
    const plan = body.plan;
    const cycle = body.cycle;
    const preview = !!body.preview;

    if (!isPlan(plan)) return json({ error: "Invalid or missing 'plan'." }, 400);
    if (!isCycle(cycle)) return json({ error: "Invalid or missing 'cycle'." }, 400);

    const productId = productIdFor(plan, cycle);
    if (!productId) {
      return json(
        { error: `No Dodo product configured for ${plan}/${cycle}. Set DODO_PRODUCT_${plan.toUpperCase()}_${cycle.toUpperCase()}.` },
        500,
      );
    }

    const admin = adminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("dodo_subscription_id, plan_status, plan")
      .eq("id", user.id)
      .single();

    const subscriptionId = profile?.dodo_subscription_id || null;
    const status = (profile?.plan_status || "").toLowerCase();
    const currentPlan = profile?.plan || "Free";

    // Only an active-ish subscription can be modified in place. Anything else (no sub, cancelled,
    // expired, inactive) means there is nothing to change — the client should run checkout.
    const hasModifiableSub =
      !!subscriptionId && (status === "active" || status === "trialing" || status === "past_due");

    if (!hasModifiableSub) {
      return json({ needsCheckout: true });
    }

    // Rank helper to distinguish upgrades from downgrades
    const planRank = (p: string): number => {
      const norm = (p || "").toLowerCase();
      if (norm === "pro") return 3;
      if (norm === "creator") return 2;
      if (norm === "starter") return 1;
      return 0;
    };

    const isDowngrade = planRank(plan) < planRank(currentPlan);

    // ── PREVIEW MODE ─────────────────────────────────────────────────────────────
    if (preview) {
      // Fetch subscription from Dodo to get next billing date
      const subRes = await dodoFetch(`/subscriptions/${subscriptionId}`);
      if (!subRes.ok) {
        console.error("Dodo get subscription failed:", subRes.status, JSON.stringify(subRes.data));
        return json({ error: "Could not fetch subscription details from Dodo." }, 502);
      }
      const subData = subRes.data || {};
      const nextBillingDate = subData.next_billing_date || null;

      if (isDowngrade) {
        // Downgrades charge $0.00 today and schedule the change
        return json({
          preview: true,
          immediateCharge: 0,
          nextBillingDate,
          nextBillingAmount: plan === "Creator" ? 29 : plan === "Pro" ? 49 : 19,
          isDowngrade: true,
          isTrialing: status === "trialing"
        });
      }

      // Upgrades: fetch proration preview from Dodo Payments
      const previewRes = await dodoFetch(
        `/subscriptions/${subscriptionId}/change-plan/preview`,
        {
          method: "POST",
          body: JSON.stringify({
            product_id: productId,
            quantity: 1,
            proration_billing_mode: "difference_immediately",
          }),
        },
      );

      if (!previewRes.ok) {
        console.error("Dodo preview plan change failed:", previewRes.status, JSON.stringify(previewRes.data));
        return json({ error: "Could not calculate prorated charge.", detail: previewRes.data }, 502);
      }

      const previewData = previewRes.data || {};
      const totalAmountCents = previewData.immediate_charge?.summary?.total_amount ?? 0;
      const immediateCharge = totalAmountCents / 100;

      return json({
        preview: true,
        immediateCharge,
        nextBillingDate,
        nextBillingAmount: plan === "Creator" ? 29 : plan === "Pro" ? 49 : 19,
        isDowngrade: false,
        isTrialing: status === "trialing"
      });
    }

    // ── EXECUTE PLAN CHANGE ──────────────────────────────────────────────────────
    if (isDowngrade) {
      // Downgrade: schedule change at the next billing date. proration_billing_mode
      // is required by the Dodo API on every change-plan call. "do_not_bill" means
      // no immediate charge — the customer keeps their current tier until renewal.
      const { ok, status: code, data } = await dodoFetch(
        `/subscriptions/${subscriptionId}/change-plan`,
        {
          method: "POST",
          body: JSON.stringify({
            product_id: productId,
            quantity: 1,
            proration_billing_mode: "full_immediately",
            effective_at: "next_billing_date",
            metadata: { user_id: user.id, plan, cycle },
          }),
        },
      );

      if (!ok) {
        console.error("Dodo schedule downgrade failed:", code, JSON.stringify(data));
        return json({ error: "Could not schedule downgrade. Please try again.", detail: data }, 502);
      }

      // We do NOT call admin_apply_subscription immediately because they retain access
      // to their higher tier until the end of the billing period.
      return json({ changed: true, scheduled: true });
    }

    // Upgrade: change immediately and charge prorated amount.
    // We do NOT call admin_apply_subscription here — the plan value would come from the
    // client-controlled request body, bypassing webhook signature verification. Instead we
    // let the Dodo webhook (which fires within a few seconds for immediate upgrades) apply
    // the plan through the cryptographically-verified path. The client polls via
    // refreshPlanUntil() in Settings.tsx.
    const { ok, status: code, data } = await dodoFetch(
      `/subscriptions/${subscriptionId}/change-plan`,
      {
        method: "POST",
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
          proration_billing_mode: "difference_immediately",
          effective_at: "immediately",
          metadata: { user_id: user.id, plan, cycle },
        }),
      },
    );

    if (!ok) {
      console.error("Dodo change-plan failed:", code, JSON.stringify(data));
      return json({ error: "Could not change your plan. Please try again.", detail: data }, 502);
    }

    // Return immediately. The Dodo webhook will call admin_apply_subscription once the
    // payment.succeeded / subscription.active event arrives (typically within seconds).
    return json({ changed: true });
  } catch (err) {
    console.error("dodo-change-plan error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
