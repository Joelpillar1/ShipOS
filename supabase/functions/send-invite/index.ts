import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, json, adminClient } from "../_shared/dodo.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "ShipOS <noreply@myshipos.com>";
const APP_URL = Deno.env.get("APP_URL") || "https://www.myshipos.com";

async function sendInviteEmail(toEmail: string, role: string, workspaceName: string, inviterName: string): Promise<void> {
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
        subject: `Join the ${workspaceName} team on ShipOS 🚀`,
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
              Team Invitation 🚀
            </h1>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 16px;">
              Hi there,
            </p>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 16px;">
              <strong>${inviterName}</strong> has invited you to join the team workspace <strong>${workspaceName}</strong> as an <strong>${role.toUpperCase()}</strong> on ShipOS!
            </p>
            <p style="font-size:15px;color:#1c1c1c;line-height:1.6;margin:0 0 24px;">
              ShipOS is the social media command center that lets teams draft, collaborate, and schedule content across X (Twitter), LinkedIn, Instagram, and TikTok from a single calendar view.
            </p>
            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
              <tr>
                <td style="background-color:#d76742;border:2px solid #1c1c1c;">
                  <a href="${APP_URL}/login?redirect=%2Fteam"
                     style="display:inline-block;padding:14px 28px;color:#ffffff;font-weight:800;
                            font-size:13px;letter-spacing:0.08em;text-transform:uppercase;
                            text-decoration:none;">
                    Accept Invitation & Join Team
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
      console.warn(`[send-invite] Resend invite email responded ${res.status}: ${body}`);
    } else {
      console.info(`[send-invite] Invitation email sent to ${toEmail}`);
    }
  } catch (e) {
    console.error("[send-invite] Failed to send invitation email:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { record } = await req.json();
    if (!record || !record.invited_email || !record.workspace_id) {
      return json({ error: "Missing required invitation fields in payload" }, 400);
    }

    const email = record.invited_email;
    const role = record.role || "viewer";
    const workspaceId = record.workspace_id;
    let invitedBy = record.invited_by;

    const authHeader = req.headers.get("Authorization") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    let isAuthorized = false;

    // Check service role
    if (authHeader.includes(serviceKey) || authHeader.includes("service_role")) {
      isAuthorized = true;
    } else {
      // Check user JWT token permissions
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      const url = Deno.env.get("SUPABASE_URL") || "";
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

      if (token && url && anonKey) {
        const userClient = createClient(url, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userErr } = await userClient.auth.getUser(token);
        if (user && !userErr) {
          invitedBy = user.id;
          
          // Verify that this user is indeed an owner or admin of the requested workspace
          const { data: membership } = await userClient
            .from("workspace_members")
            .select("role")
            .eq("workspace_id", workspaceId)
            .eq("user_id", user.id)
            .single();

          if (membership && (membership.role === "owner" || membership.role === "admin")) {
            isAuthorized = true;
          }
        }
      }
    }

    if (!isAuthorized) {
      return json({ error: "Unauthorized" }, 401);
    }

    console.info(`[send-invite] Sending invitation to ${email} for workspace ${workspaceId}`);

    // Fetch workspace name and inviter name using the admin client
    const supabase = adminClient();

    const [wsRes, inviterRes] = await Promise.all([
      supabase.from("workspaces").select("name").eq("id", workspaceId).single(),
      invitedBy ? supabase.from("profiles").select("name").eq("id", invitedBy).single() : Promise.resolve({ data: null })
    ]);

    const workspaceName = wsRes.data?.name || "Main Workspace";
    const inviterName = inviterRes.data?.name || "A team member";

    await sendInviteEmail(email, role, workspaceName, inviterName);

    return json({ success: true });
  } catch (err) {
    console.error("[send-invite] Unexpected handler error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});

