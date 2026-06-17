import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  adminClient,
  corsHeaders,
  dodoFetch,
  getAuthedUser,
  isCycle,
  isPlan,
  json,
  normalizeTrialEmail,
  productIdFor,
} from "../_shared/dodo.ts";

// Creates a Dodo subscription with a 7-day trial and returns the hosted checkout URL the
// client redirects to. The subscription is tagged with metadata.user_id so the webhook can
// map the eventual payment back to this user. Plans/credits are NOT granted here — only the
// verified webhook grants a paid plan.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized: please sign in to subscribe." }, 401);

    const { plan, cycle } = await req.json().catch(() => ({}));
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
      .select("name, dodo_customer_id, dodo_subscription_id, plan_status, has_used_trial")
      .eq("id", user.id)
      .single();

    // ── Guard against creating a SECOND subscription (double-billing) ───────────────
    // dodo-checkout only ever creates a brand-new subscription. If the user already has a
    // live one, a duplicate call here (UI double-click, stale tab, or a direct API hit) would
    // start a second subscription and bill them twice. Plan/cycle changes for an existing
    // subscriber must go through dodo-change-plan (proration, no new trial) instead.
    //
    // We treat active / trialing / past_due as "live". The local plan_status is maintained by
    // the verified webhook, but it can lag a cancellation, so before blocking we confirm with
    // Dodo that the subscription is genuinely still active — otherwise a user who cancelled and
    // wants to re-subscribe would be stuck.
    const existingSubId = profile?.dodo_subscription_id || null;
    const liveStatus = (profile?.plan_status || "").toLowerCase();
    const looksActive =
      !!existingSubId &&
      (liveStatus === "active" || liveStatus === "trialing" || liveStatus === "past_due");

    if (looksActive) {
      // Source-of-truth check against Dodo. Only block if Dodo also reports a non-terminal status.
      const subRes = await dodoFetch(`/subscriptions/${existingSubId}`);
      const dodoStatus = (subRes.data?.status || "").toLowerCase();
      const terminal = ["cancelled", "canceled", "expired", "failed", ""];
      const stillActiveOnDodo = subRes.ok && !terminal.includes(dodoStatus);

      if (stillActiveOnDodo) {
        // Tell the client to route through the change-plan flow instead of checkout.
        return json(
          {
            error: "You already have an active subscription. Use 'Change plan' to switch tiers.",
            alreadySubscribed: true,
          },
          409,
        );
      }
      // Otherwise the local status was stale (subscription is terminal on Dodo) — fall through
      // and let the user start a fresh subscription.
    }

    // ── Trial eligibility (anti-farming) ───────────────────────────────────────────
    // The 7-day free trial is granted to genuine first-time subscribers only. Two layers:
    //   1. profiles.has_used_trial — per-account flag, flipped true by the webhook once a
    //      subscription starts, so cancel-and-re-subscribe on the SAME account gets no new trial.
    //   2. trial_ledger — a GLOBAL ledger keyed by normalized email mailbox, so creating a new
    //      account with an aliased/duplicate email (the common farming move) is also denied a
    //      trial. The card can't be fingerprinted here because Dodo only charges AFTER the trial,
    //      so the mailbox is the strongest pre-trial signal available.
    let trialUsed = !!profile?.has_used_trial;
    const emailNorm = normalizeTrialEmail(user.email);
    if (!trialUsed && emailNorm) {
      const { data: ledgerRow } = await admin
        .from("trial_ledger")
        .select("email_norm")
        .eq("email_norm", emailNorm)
        .maybeSingle();
      if (ledgerRow) trialUsed = true;
    }
    const trialDays = trialUsed ? 0 : 7;

    const appUrl = (Deno.env.get("APP_URL") || "").replace(/\/$/, "");
    const returnUrl = `${appUrl}/billing/success`;
    // Where Dodo sends the user if they abandon / back out of the hosted checkout. Without this,
    // an abandoning user is dropped on the success/confirm screen (the only URL Dodo had), which
    // then can't confirm a subscription. Send them back to the onboarding plan picker instead;
    // onboarding was never marked complete, so they resume on the pricing step.
    const cancelUrl = `${appUrl}/onboarding`;
    const email = user.email || "";
    const name = profile?.name || user.user_metadata?.name || email || "ShipOS user";

    // Reuse the existing Dodo customer if we have one, otherwise let Dodo create one from the
    // email/name. The hosted checkout page collects the billing address.
    const customer = profile?.dodo_customer_id
      ? { customer_id: profile.dodo_customer_id }
      : { email, name };

    const body = {
      product_id: productId,
      quantity: 1,
      trial_period_days: trialDays,
      payment_link: true,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      customer,
      // Default billing country; the customer can change it on the hosted page.
      billing: { country: Deno.env.get("DODO_DEFAULT_COUNTRY") || "US" },
      metadata: { user_id: user.id, plan, cycle },
    };

    const { ok, status, data } = await dodoFetch("/subscriptions", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!ok) {
      console.error("Dodo create subscription failed:", status, JSON.stringify(data));
      return json({ error: "Could not start checkout. Please try again.", detail: data }, 502);
    }

    // Field names vary across Dodo API versions — accept the common variants.
    const checkoutUrl = data?.payment_link || data?.checkout_url || data?.url || null;
    const customerId = data?.customer?.customer_id || data?.customer_id || null;

    if (!checkoutUrl) {
      console.error("Dodo response missing checkout URL:", JSON.stringify(data));
      return json({ error: "Checkout URL was not returned by the payment provider." }, 502);
    }

    // Persist the customer id now so a returning user reuses the same Dodo customer (only
    // writes if not already set).
    if (customerId) {
      await admin.rpc("admin_set_dodo_customer", {
        p_user_id: user.id,
        p_customer_id: customerId,
      });
    }

    return json({ url: checkoutUrl });
  } catch (err) {
    console.error("dodo-checkout error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
