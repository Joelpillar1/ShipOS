import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Permanently deletes the signed-in user's own account. Deleting the Supabase auth user cascades
// to every user-owned row (profiles, posts, notifications, studio_queue, workspaces,
// workspace_members) through the ON DELETE CASCADE foreign keys defined in the schema, so there
// is nothing else to clean up here.
//
// Configured with verify_jwt = false so the browser CORS preflight (OPTIONS) is not blocked by
// platform auth. The function verifies the real user from their Authorization bearer token in
// code, then performs the deletion with the service role.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!url || !anonKey || !serviceKey) {
    console.error("delete-account: missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY");
    return json({ error: "Server is not configured." }, 500);
  }

  // Resolve the caller from their JWT (anon client used only to validate the bearer token).
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Unauthorized: please sign in." }, 401);

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await authClient.auth.getUser(token);
  if (userErr || !userData?.user) return json({ error: "Unauthorized: invalid session." }, 401);

  const userId = userData.user.id;

  // Service-role client performs the actual deletion; the cascade removes all related rows.
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Cancel any active Dodo subscription first, so a deleted user is never billed again. We read
  // the subscription id (still present until the row is deleted below) and cancel it immediately
  // via PATCH /subscriptions/{id}. Best-effort: log but don't block deletion if it fails, since
  // the user is leaving regardless — but surface nothing that would leave them silently billed.
  const { data: profile } = await admin
    .from("profiles")
    .select("dodo_subscription_id")
    .eq("id", userId)
    .single();

  const subscriptionId = profile?.dodo_subscription_id || null;
  if (subscriptionId) {
    const apiKey = Deno.env.get("DODO_API_KEY") || "";
    const env = (Deno.env.get("DODO_ENVIRONMENT") || "test_mode").toLowerCase();
    const dodoBase = env === "live_mode" || env === "live"
      ? "https://live.dodopayments.com"
      : "https://test.dodopayments.com";
    if (apiKey) {
      try {
        const res = await fetch(`${dodoBase}/subscriptions/${subscriptionId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled", cancel_reason: "cancelled_by_customer" }),
        });
        if (!res.ok) {
          console.error("delete-account: failed to cancel subscription", subscriptionId, res.status, await res.text());
        }
      } catch (e) {
        console.error("delete-account: error cancelling subscription", subscriptionId, e);
      }
    } else {
      console.error("delete-account: DODO_API_KEY not set — cannot cancel subscription", subscriptionId);
    }
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) {
    console.error("delete-account: failed to delete user", userId, delErr);
    return json({ error: "Could not delete the account. Please try again." }, 500);
  }

  return json({ deleted: true });
});
