import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, json } from "../_shared/dodo.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "ShipOS <noreply@myshipos.com>";
const APP_URL = Deno.env.get("APP_URL") || "https://www.myshipos.com";

// Helper: Add contact to Resend Audience
async function addContactToResend(email: string, fullName: string) {
  if (!RESEND_API_KEY || !email) return;

  try {
    // 1. Fetch available audiences in Resend
    const listRes = await fetch("https://api.resend.com/audiences", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
    });

    if (!listRes.ok) {
      const errBody = await listRes.text();
      console.warn(`[handle-signup] Failed to fetch Resend audiences (${listRes.status}): ${errBody}`);
      return;
    }

    const resJson = await listRes.json();
    const audiences = resJson.data;
    if (!audiences || audiences.length === 0) {
      console.info("[handle-signup] No audiences found in Resend to add contact to.");
      return;
    }

    // Use the first audience ID
    const audienceId = audiences[0].id;
    const audienceName = audiences[0].name;

    // Split name into first and last
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // 2. Add contact to the audience
    const contactRes = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        unsubscribed: false,
      }),
    });

    if (!contactRes.ok) {
      const errBody = await contactRes.text();
      console.warn(`[handle-signup] Failed to add contact to Resend audience ${audienceName} (${contactRes.status}): ${errBody}`);
    } else {
      console.info(`[handle-signup] Successfully added ${email} to Resend audience: ${audienceName}`);
    }
  } catch (e) {
    console.error("[handle-signup] Error in Resend contact synchronization (non-fatal):", e);
  }
}

// Helper: Send Resend welcome email
async function sendWelcomeEmail(toEmail: string, userName: string): Promise<void> {
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
        subject: "Welcome to ShipOS! 🚀",
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
              Welcome to ShipOS! 🚀
            </h1>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 16px;">
              Hi ${userName || "there"},
            </p>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 16px;">
              We're thrilled to have you here! ShipOS is your social media command center designed to let you write once, schedule everywhere, and multiply your distribution.
            </p>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 24px;">
              Here is how to get started in under 5 minutes:
            </p>
            <ul style="font-size:14px;color:#1c1c1c;line-height:1.6;margin:0 0 24px;padding-left:20px;">
              <li style="margin-bottom:8px;"><strong>Connect your accounts:</strong> Link X (Twitter), LinkedIn, Instagram, or TikTok in seconds.</li>
              <li style="margin-bottom:8px;"><strong>Draft a post:</strong> Drop a topic into our AI Content Studio and pull the trigger.</li>
              <li style="margin-bottom:8px;"><strong>Try Slideshow Studio:</strong> Format, export, and schedule high-converting visual slide carousels.</li>
            </ul>
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
              If you have any questions, reply to this email. We're here to help! Visit <a href="${APP_URL}" style="color:#d76742;text-decoration:none;font-weight:700;">${APP_URL}</a>.
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
      console.warn(`[handle-signup] Resend welcome email responded ${res.status}: ${body}`);
    } else {
      console.info(`[handle-signup] Welcome email sent to ${toEmail}`);
    }
  } catch (e) {
    console.error("[handle-signup] Failed to send welcome email:", e);
  }
}

// Main Deno server handler
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Guard: require authentication via service-role key
  const authHeader = req.headers.get("Authorization") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!authHeader.includes(serviceKey) && !authHeader.includes("service_role")) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const { record } = await req.json();
    if (!record || !record.email) {
      return json({ error: "Missing user record or email in payload" }, 400);
    }

    const email = record.email;
    const name = record.name || record.full_name || "there";

    console.info(`[handle-signup] Processing signup for ${email}`);

    // Sync to Resend Contact list and send welcome email concurrently
    await Promise.all([
      addContactToResend(email, name),
      sendWelcomeEmail(email, name),
    ]);

    return json({ success: true });
  } catch (err) {
    console.error("[handle-signup] Unexpected handler error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
