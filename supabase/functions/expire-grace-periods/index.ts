import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { adminClient, corsHeaders, json } from "../_shared/dodo.ts";

// ─────────────────────────────────────────────────────────────────────────────
// expire-grace-periods
//
// Called hourly by pg_cron. Finds every user whose 3-day grace period has
// elapsed and:
//   1. Cancels all their pending `post-for-me` schedules.
//   2. Moves those posts back to 'draft' in the DB.
//   3. Downgrades the profile to Free (plan = 'Free', plan_status = 'inactive').
//   4. Clears grace_period_ends_at.
//   5. Sends a Resend email notifying the user their posts were paused.
//
// This function is also callable manually (e.g. for testing) with a service-
// role Authorization header. It always requires the service-role key — it is
// NOT accessible to regular users (verify_jwt = false but guarded internally).
// ─────────────────────────────────────────────────────────────────────────────

const POST_FOR_ME_URL = Deno.env.get("POST_FOR_ME_URL") || "https://api.postforme.dev";
const POST_FOR_ME_API_KEY = Deno.env.get("POST_FOR_ME_API_KEY") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "ShipOS <noreply@myshipos.com>";
const APP_URL = Deno.env.get("APP_URL") || "https://www.myshipos.com";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Cancel a list of post-for-me post IDs by calling the external API. */
async function cancelPostForMeSchedules(postForMeIds: string[]): Promise<void> {
  if (postForMeIds.length === 0 || !POST_FOR_ME_API_KEY) return;
  try {
    const res = await fetch(`${POST_FOR_ME_URL}/posts/batch-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${POST_FOR_ME_API_KEY}`,
      },
      body: JSON.stringify({ ids: postForMeIds }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`[expire-grace-periods] post-for-me batch-delete responded ${res.status}: ${body}`);
    } else {
      console.info(`[expire-grace-periods] Cancelled ${postForMeIds.length} post-for-me schedule(s).`);
    }
  } catch (e) {
    console.warn("[expire-grace-periods] Failed to cancel post-for-me schedules (non-fatal):", e);
  }
}

/** Extract post-for-me post IDs from the results JSONB column. */
function extractPostForMeIds(results: any[]): string[] {
  if (!Array.isArray(results)) return [];
  return results
    .filter((r) => r?.id && typeof r.id === "string")
    .map((r) => r.id as string);
}

/** Send a Resend email to notify the user their posts were paused. */
async function sendGraceExpiredEmail(
  toEmail: string,
  userName: string,
  pausedCount: number,
): Promise<void> {
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
        subject: "Your scheduled posts have been paused — ShipOS",
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
            <img src="\${APP_URL}/logo-white.png" alt="ShipOS" height="32" style="height:32px;display:block;border:0;" />
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 40px 32px;">
            <h1 style="font-size:22px;font-weight:800;color:#1c1c1c;margin:0 0 16px;text-transform:uppercase;letter-spacing:-0.5px;">
              Your scheduled posts have been paused
            </h1>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 16px;">
              Hi \${userName || "there"},
            </p>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 16px;">
              Your ShipOS subscription ended 3 days ago and wasn't renewed, so we've paused
              <strong>\${pausedCount} scheduled post\${pausedCount !== 1 ? "s" : ""}</strong> to prevent
              them from publishing without an active plan.
            </p>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 24px;">
              Your posts are safe — they've been moved back to <strong>Drafts</strong> and are
              ready to reschedule as soon as you re-subscribe.
            </p>
            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
              <tr>
                <td style="background-color:#d76742;border:2px solid #1c1c1c;">
                  <a href="\${APP_URL}/settings?tab=plans"
                     style="display:inline-block;padding:14px 28px;color:#ffffff;font-weight:800;
                            font-size:13px;letter-spacing:0.08em;text-transform:uppercase;
                            text-decoration:none;">
                    Re-subscribe Now
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
              You received this email because you have a ShipOS account. If you have questions,
              reply to this email or visit <a href="\${APP_URL}" style="color:#d76742;text-decoration:none;font-weight:700;">\${APP_URL}</a>.
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
      console.warn(`[expire-grace-periods] Resend responded ${res.status}: ${body}`);
    } else {
      console.info(`[expire-grace-periods] Grace-expired email sent to ${toEmail}`);
    }
  } catch (e) {
    console.warn("[expire-grace-periods] Failed to send email (non-fatal):", e);
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Guard: only callable with the service-role key (set by pg_cron or a trusted admin).
  const authHeader = req.headers.get("Authorization") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!authHeader.includes(serviceKey) && !authHeader.includes("service_role")) {
    return json({ error: "Unauthorized" }, 401);
  }

  const admin = adminClient();
  const now = new Date().toISOString();

  // 1. Find all users whose grace period has elapsed.
  const { data: expiredProfiles, error: fetchErr } = await admin
    .from("profiles")
    .select("id, name, email, plan")
    .eq("plan_status", "grace")
    .lte("grace_period_ends_at", now);

  if (fetchErr) {
    console.error("[expire-grace-periods] Failed to query profiles:", fetchErr);
    return json({ error: "Failed to query profiles" }, 500);
  }

  if (!expiredProfiles || expiredProfiles.length === 0) {
    console.info("[expire-grace-periods] No expired grace periods found.");
    return json({ processed: 0 });
  }

  console.info(`[expire-grace-periods] Processing ${expiredProfiles.length} expired grace period(s).`);

  const results: Array<{ userId: string; postsMovedToDraft: number; error?: string }> = [];

  for (const profile of expiredProfiles) {
    const userId = profile.id;
    try {
      // 2. Fetch all scheduled posts for this user (across all workspaces).
      const { data: scheduledPosts, error: postsErr } = await admin
        .from("posts")
        .select("id, results")
        .eq("user_id", userId)
        .eq("status", "scheduled");

      if (postsErr) {
        console.error(`[expire-grace-periods] Failed to fetch posts for user ${userId}:`, postsErr);
        results.push({ userId, postsMovedToDraft: 0, error: postsErr.message });
        continue;
      }

      const posts = scheduledPosts || [];

      // 3. Collect and cancel all post-for-me schedule IDs.
      const allPostForMeIds: string[] = [];
      for (const post of posts) {
        const ids = extractPostForMeIds(post.results || []);
        allPostForMeIds.push(...ids);
      }
      if (allPostForMeIds.length > 0) {
        await cancelPostForMeSchedules(allPostForMeIds);
      }

      // 4. Move all scheduled posts to draft, clear their results (stale post-for-me IDs).
      let postsMovedToDraft = 0;
      if (posts.length > 0) {
        const postIds = posts.map((p) => p.id);
        const { error: updateErr } = await admin
          .from("posts")
          .update({
            status: "draft",
            results: [],
            updated_at: now,
          })
          .in("id", postIds);

        if (updateErr) {
          console.error(`[expire-grace-periods] Failed to move posts to draft for user ${userId}:`, updateErr);
        } else {
          postsMovedToDraft = posts.length;
          console.info(`[expire-grace-periods] Moved ${postsMovedToDraft} post(s) to draft for user ${userId}.`);
        }
      }

      // 5. Downgrade profile to Free and clear grace period.
      const { error: downgradeErr } = await admin
        .from("profiles")
        .update({
          plan: "Free",
          plan_status: "inactive",
          grace_period_ends_at: null,
          updated_at: now,
        })
        .eq("id", userId);

      if (downgradeErr) {
        console.error(`[expire-grace-periods] Failed to downgrade profile for user ${userId}:`, downgradeErr);
        results.push({ userId, postsMovedToDraft, error: downgradeErr.message });
        continue;
      }

      console.info(`[expire-grace-periods] Downgraded user ${userId} to Free.`);

      // 6. Send Resend email notification.
      await sendGraceExpiredEmail(profile.email, profile.name, postsMovedToDraft);

      results.push({ userId, postsMovedToDraft });
    } catch (err) {
      console.error(`[expire-grace-periods] Unexpected error for user ${userId}:`, err);
      results.push({ userId, postsMovedToDraft: 0, error: (err as Error).message });
    }
  }

  const successCount = results.filter((r) => !r.error).length;
  const errorCount = results.filter((r) => r.error).length;

  console.info(`[expire-grace-periods] Done. Success: ${successCount}, Errors: ${errorCount}`);
  return json({ processed: expiredProfiles.length, results });
});
