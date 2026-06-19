import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { adminClient, corsHeaders, dodoFetch, json, normalizeTrialEmail, planForProduct } from "../_shared/dodo.ts";

// Receives Dodo Payments webhook events, verifies the Standard-Webhooks signature, and applies
// the resulting subscription state to the user's profile. This is the ONLY trusted path that
// grants a paid plan. Configured with verify_jwt = false (Dodo signs, not Supabase auth).

const GRACE_PERIOD_DAYS = 3;

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "ShipOS <noreply@myshipos.com>";
const APP_URL = Deno.env.get("APP_URL") || "https://www.myshipos.com";

// ── Resend Email Notification Helpers ────────────────────────────────────────

async function sendTrialWelcomeEmail(toEmail: string, userName: string, planName: string): Promise<void> {
  if (!RESEND_API_KEY || !toEmail) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        subject: `Welcome to your ShipOS Free Trial! 🚀`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f8f5f1;font-family:ui-sans-serif,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f5f1;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:2px solid #1c1c1c;max-width:520px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background-color:#1c1c1c;padding:24px 32px;border-bottom:4px solid #d76742;">
            <img src="https://wrjgmczyhixiqtigucwh.supabase.co/storage/v1/object/public/ShipOS/Logo%20white.png" alt="ShipOS" height="32" style="height:32px;display:block;border:0;" />
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 40px 32px;">
            <h1 style="font-size:22px;font-weight:800;color:#1c1c1c;margin:0 0 16px;text-transform:uppercase;letter-spacing:-0.5px;">
              Welcome to ShipOS!
            </h1>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 16px;">
              Hi ${userName || "there"},
            </p>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 16px;">
              Thanks for starting a free trial of the <strong>${planName || "Paid"} Plan</strong> on ShipOS! We're thrilled to help you automate and scale your social media content pipeline.
            </p>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 24px;">
              You now have full access to all your plan's capabilities. Your 7-day trial is completely free.
            </p>
            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
              <tr>
                <td style="background-color:#d76742;border:2px solid #1c1c1c;">
                  <a href="${APP_URL}"
                     style="display:inline-block;padding:14px 28px;color:#ffffff;font-weight:800;
                            font-size:13px;letter-spacing:0.08em;text-transform:uppercase;
                            text-decoration:none;">
                    Go to Dashboard
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:2px solid #1c1c1c;background-color:#f8f5f1;">
            <p style="font-size:12px;color:#666666;margin:0;line-height:1.6;">
              You received this email because you started a free trial on ShipOS. If you have questions, visit <a href="${APP_URL}" style="color:#d76742;text-decoration:none;font-weight:700;">${APP_URL}</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`[dodo-webhook] Resend welcome email responded ${res.status}: ${body}`);
    } else {
      console.info(`[dodo-webhook] Welcome email sent to ${toEmail}`);
    }
  } catch (e) {
    console.warn("[dodo-webhook] Failed to send welcome email (non-fatal):", e);
  }
}

async function sendGraceStartedEmail(toEmail: string, userName: string, graceEndsAt: string): Promise<void> {
  if (!RESEND_API_KEY || !toEmail) return;
  try {
    const dateStr = new Date(graceEndsAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        subject: `Action Required: Your subscription ended — 3 days left to renew`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f8f5f1;font-family:ui-sans-serif,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f5f1;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:2px solid #1c1c1c;max-width:520px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background-color:#1c1c1c;padding:24px 32px;border-bottom:4px solid #d76742;">
            <img src="https://wrjgmczyhixiqtigucwh.supabase.co/storage/v1/object/public/ShipOS/Logo%20white.png" alt="ShipOS" height="32" style="height:32px;display:block;border:0;" />
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 40px 32px;">
            <h1 style="font-size:22px;font-weight:800;color:#1c1c1c;margin:0 0 16px;text-transform:uppercase;letter-spacing:-0.5px;">
              Subscription Ended — Grace Period Active
            </h1>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 16px;">
              Hi ${userName || "there"},
            </p>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 16px;">
              Your ShipOS subscription has ended. To make sure you don't experience any interruptions, we have started a <strong>3-day grace period</strong> for your account.
            </p>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 24px;">
              <strong>Your scheduled posts are still safe and will continue to publish.</strong> However, if you don't renew by <strong>${dateStr}</strong>, your scheduled posts will be paused and moved to Drafts.
            </p>
            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
              <tr>
                <td style="background-color:#d76742;border:2px solid #1c1c1c;">
                  <a href="${APP_URL}/settings?tab=plans"
                     style="display:inline-block;padding:14px 28px;color:#ffffff;font-weight:800;
                            font-size:13px;letter-spacing:0.08em;text-transform:uppercase;
                            text-decoration:none;">
                    Renew Subscription
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:2px solid #1c1c1c;background-color:#f8f5f1;">
            <p style="font-size:12px;color:#666666;margin:0;line-height:1.6;">
              If you have already renewed, you can safely ignore this email. Visit <a href="${APP_URL}" style="color:#d76742;text-decoration:none;font-weight:700;">${APP_URL}</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`[dodo-webhook] Resend grace email responded ${res.status}: ${body}`);
    } else {
      console.info(`[dodo-webhook] Grace started email sent to ${toEmail}`);
    }
  } catch (e) {
    console.warn("[dodo-webhook] Failed to send grace email (non-fatal):", e);
  }
}

async function sendSubscriptionActiveEmail(toEmail: string, userName: string, planName: string): Promise<void> {
  if (!RESEND_API_KEY || !toEmail) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        subject: `Your ShipOS subscription is active! 🎉`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f8f5f1;font-family:ui-sans-serif,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f5f1;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:2px solid #1c1c1c;max-width:520px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background-color:#1c1c1c;padding:24px 32px;border-bottom:4px solid #d76742;">
            <img src="https://wrjgmczyhixiqtigucwh.supabase.co/storage/v1/object/public/ShipOS/Logo%20white.png" alt="ShipOS" height="32" style="height:32px;display:block;border:0;" />
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 40px 32px;">
            <h1 style="font-size:22px;font-weight:800;color:#1c1c1c;margin:0 0 16px;text-transform:uppercase;letter-spacing:-0.5px;">
              Subscription Active
            </h1>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 16px;">
              Hi ${userName || "there"},
            </p>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 16px;">
              Thank you! Your subscription to the <strong>${planName || "Paid"}</strong> plan on ShipOS has been successfully activated.
            </p>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 24px;">
              Your scheduled posts are fully active, safe, and will continue to publish according to your queue schedule.
            </p>
            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
              <tr>
                <td style="background-color:#d76742;border:2px solid #1c1c1c;">
                  <a href="${APP_URL}"
                     style="display:inline-block;padding:14px 28px;color:#ffffff;font-weight:800;
                            font-size:13px;letter-spacing:0.08em;text-transform:uppercase;
                            text-decoration:none;">
                    Go to Dashboard
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:2px solid #1c1c1c;background-color:#f8f5f1;">
            <p style="font-size:12px;color:#666666;margin:0;line-height:1.6;">
              Thank you for being a part of ShipOS! Visit <a href="${APP_URL}" style="color:#d76742;text-decoration:none;font-weight:700;">${APP_URL}</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`[dodo-webhook] Resend active email responded ${res.status}: ${body}`);
    } else {
      console.info(`[dodo-webhook] Subscription active email sent to ${toEmail}`);
    }
  } catch (e) {
    console.warn("[dodo-webhook] Failed to send active email (non-fatal):", e);
  }
}

// Map a Dodo event/subscription status to our profile plan_status vocabulary.
function resolveStatus(eventType: string, subStatus: string | undefined): string {
  const s = (subStatus || "").toLowerCase();
  if (s === "trialing" || s === "on_trial") return "trialing";
  // Cancellation is scheduled (keep access until period end); expiry is the actual end (downgrade).
  if (eventType === "subscription.cancelled") return "cancelled";
  if (eventType === "subscription.expired") return "expired";
  if (
    eventType === "subscription.on_hold" ||
    eventType === "subscription.failed" ||
    eventType === "payment.failed"
  ) {
    return "past_due";
  }
  if (
    eventType === "subscription.active" ||
    eventType === "subscription.renewed" ||
    eventType === "payment.succeeded"
  ) {
    return "active";
  }
  // Fall back to the raw subscription status when present.
  if (s) return s;
  // Unknown event type with no recognisable status: default to "unknown" (treated as terminal
  // by admin_apply_subscription, which safely downgrades to Free). Never default to "active"
  // as that would grant a paid plan for an unverified or unrecognised event.
  return "unknown";
}

// Returns true for events that should START a 3-day grace period rather than
// immediately downgrading the user to Free.
function isTerminalEvent(eventType: string, status: string): boolean {
  // subscription.expired = the subscription billing period actually ended with no renewal.
  // subscription.cancelled + status resolved to 'expired'/'cancelled' from Dodo's side means
  // the user actively cancelled and the period has now elapsed.
  return (
    eventType === "subscription.expired" ||
    (eventType === "subscription.cancelled" && status === "cancelled")
  );
}

// Returns true for events that should CLEAR any active grace period (user renewed).
function isRenewalEvent(eventType: string, status: string): boolean {
  return (
    status === "active" ||
    status === "trialing" ||
    eventType === "subscription.active" ||
    eventType === "subscription.renewed" ||
    eventType === "payment.succeeded"
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const secret = Deno.env.get("DODO_WEBHOOK_SECRET") || "";
  if (!secret) {
    console.error("DODO_WEBHOOK_SECRET is not set");
    return json({ error: "Webhook not configured" }, 500);
  }

  // Raw body is required for signature verification — do not parse before verifying.
  const raw = await req.text();
  const headers = {
    "webhook-id": req.headers.get("webhook-id") || "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
    "webhook-signature": req.headers.get("webhook-signature") || "",
  };

  let event: any;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(raw, headers);
  } catch (err) {
    console.error("Webhook signature verification failed:", (err as Error).message);
    return json({ error: "Invalid signature" }, 401);
  }

  try {
    const type: string = event?.type || "";
    const data: any = event?.data || {};

    // Only subscription-bearing events change the plan.
    const subscriptionId: string | null = data?.subscription_id || data?.id || null;
    const customerId: string | null = data?.customer?.customer_id || data?.customer_id || null;
    const productId: string | null = data?.product_id || null;
    const metadata: any = data?.metadata || {};

    if (!type.startsWith("subscription.") && type !== "payment.succeeded" && type !== "payment.failed") {
      return json({ received: true, ignored: type });
    }

    const admin = adminClient();

    // Resolve the user: prefer metadata.user_id set at checkout, then the stored subscription
    // id, then the customer id.
    let userId: string | null = metadata?.user_id || null;
    if (!userId && subscriptionId) {
      const { data: p } = await admin
        .from("profiles")
        .select("id")
        .eq("dodo_subscription_id", subscriptionId)
        .maybeSingle();
      userId = p?.id || null;
    }
    if (!userId && customerId) {
      const { data: p } = await admin
        .from("profiles")
        .select("id")
        .eq("dodo_customer_id", customerId)
        .maybeSingle();
      userId = p?.id || null;
    }

    if (!userId) {
      console.error("Webhook could not resolve a user for event", type, { subscriptionId, customerId });
      // 200 so Dodo doesn't retry forever on an unmappable event.
      return json({ received: true, unresolved: true });
    }

    // Fetch profile before updating it, so we know their previous state and can send emails on transitions.
    const { data: profileBefore, error: profileErr } = await admin
      .from("profiles")
      .select("name, email, plan, plan_status")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr || !profileBefore) {
      console.warn(`[dodo-webhook] Failed to fetch profile before update for user ${userId}:`, profileErr);
    }

    // Resolve the plan and any pending scheduled change from the subscription.
    let resolvedProductId = productId;
    let scheduledChange = data?.scheduled_change || null;

    if (subscriptionId) {
      // If we don't have the product ID, or if this is a payment event (which doesn't include the
      // full subscription object), we fetch the subscription to get the absolute source of truth.
      if (!resolvedProductId || !type.startsWith("subscription.")) {
        const subRes = await dodoFetch(`/subscriptions/${subscriptionId}`);
        if (subRes.ok) {
          resolvedProductId = subRes.data?.product_id || resolvedProductId;
          scheduledChange = subRes.data?.scheduled_change || null;
        }
      }
    }

    const plan = (resolvedProductId ? planForProduct(resolvedProductId) : null) || metadata?.plan || null;
    const status = resolveStatus(type, data?.status);

    // If there is a scheduled plan change, extract the pending plan and its effective date.
    let pendingPlan: string | null = null;
    let pendingPlanEffectiveAt: string | null = null;

    if (scheduledChange) {
      const pendingProductId = scheduledChange.product_id;
      pendingPlan = pendingProductId ? planForProduct(pendingProductId) : null;
      pendingPlanEffectiveAt = scheduledChange.effective_at || null;
    }

    // ── Grace period logic ────────────────────────────────────────────────────
    // For terminal events (subscription actually ended): instead of immediately
    // downgrading to Free, set plan_status = 'grace' and grace_period_ends_at =
    // NOW() + 3 days. The `expire-grace-periods` function handles the actual
    // downgrade + post cancellation after the window elapses.
    //
    // For renewal events: clear any active grace period immediately.
    // ─────────────────────────────────────────────────────────────────────────

    if (isTerminalEvent(type, status)) {
      // Compute grace period end timestamp.
      const graceEndsAt = new Date(Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString();

      // Apply grace status via admin_apply_subscription (keeps plan, sets status = 'grace').
      const { error: applyErr } = await admin.rpc("admin_apply_subscription", {
        p_user_id: userId,
        p_plan: plan,          // keep their current plan during grace
        p_status: "grace",     // our custom grace status
        p_subscription_id: subscriptionId,
        p_customer_id: customerId,
        p_pending_plan: pendingPlan,
        p_pending_plan_effective_at: pendingPlanEffectiveAt,
      });

      if (applyErr) {
        console.error("admin_apply_subscription (grace) failed:", applyErr);
        return json({ error: "Failed to apply grace period" }, 500);
      }

      // Stamp the grace period end date directly on the profile row.
      const { error: graceErr } = await admin
        .from("profiles")
        .update({ grace_period_ends_at: graceEndsAt })
        .eq("id", userId);

      if (graceErr) {
        console.error("Failed to set grace_period_ends_at:", graceErr);
        // Non-fatal — the status is already set; the expire job will catch it.
      }

      // Send grace period warning email if they weren't already in grace.
      if (profileBefore && profileBefore.plan_status !== "grace") {
        await sendGraceStartedEmail(profileBefore.email, profileBefore.name, graceEndsAt);
      }

      console.info(`Grace period started for user ${userId}, ends at ${graceEndsAt}`);
      return json({ received: true, type, status: "grace", graceEndsAt });
    }

    if (isRenewalEvent(type, status)) {
      // User renewed — clear any grace period before applying the active status.
      const { error: clearErr } = await admin
        .from("profiles")
        .update({ grace_period_ends_at: null })
        .eq("id", userId);

      if (clearErr) {
        console.warn("Failed to clear grace_period_ends_at on renewal (non-fatal):", clearErr);
      }
    }

    // Standard path: apply subscription state via the trusted RPC.
    const { error } = await admin.rpc("admin_apply_subscription", {
      p_user_id: userId,
      p_plan: plan,
      p_status: status,
      p_subscription_id: subscriptionId,
      p_customer_id: customerId,
      p_pending_plan: pendingPlan,
      p_pending_plan_effective_at: pendingPlanEffectiveAt,
    });

    if (error) {
      console.error("admin_apply_subscription failed:", error);
      return json({ error: "Failed to apply subscription" }, 500);
    }

    // Record this user's mailbox in the global trial ledger once a subscription actually starts,
    // mirroring when admin_apply_subscription sets has_used_trial. This is what makes a future
    // signup with the same (aliased) email ineligible for another free trial — see dodo-checkout.
    if (status === "active" || status === "trialing") {
      try {
        const { data: p } = await admin
          .from("profiles")
          .select("email")
          .eq("id", userId)
          .maybeSingle();
        const emailNorm = normalizeTrialEmail(p?.email);
        if (emailNorm) {
          await admin
            .from("trial_ledger")
            .upsert(
              { email_norm: emailNorm, first_user_id: userId },
              { onConflict: "email_norm", ignoreDuplicates: true },
            );
        }
      } catch (ledgerErr) {
        // Non-fatal: the subscription is already applied; failing to record the ledger entry
        // must not fail the webhook (Dodo would retry and re-apply unnecessarily).
        console.error("Failed to record trial ledger entry:", ledgerErr);
      }
    }

    // Send welcome / activation emails on state transition.
    if (profileBefore) {
      if (profileBefore.plan_status !== "trialing" && status === "trialing") {
        await sendTrialWelcomeEmail(profileBefore.email, profileBefore.name, plan || "Creator");
      } else if (profileBefore.plan_status !== "active" && status === "active") {
        await sendSubscriptionActiveEmail(profileBefore.email, profileBefore.name, plan || "Creator");
      }
    }

    return json({ received: true, type, status });
  } catch (err) {
    console.error("dodo-webhook error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
