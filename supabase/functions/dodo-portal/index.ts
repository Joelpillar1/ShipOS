import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { adminClient, corsHeaders, dodoFetch, getAuthedUser, json } from "../_shared/dodo.ts";

// Returns a Dodo hosted customer-portal URL for the signed-in user, where they can update
// their card, view invoices, and cancel. Requires that the user has an existing Dodo customer
// id (set during their first checkout).
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const admin = adminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("dodo_customer_id")
      .eq("id", user.id)
      .single();

    const customerId = profile?.dodo_customer_id;
    if (!customerId) {
      return json({ error: "No billing account found. Subscribe to a plan first." }, 404);
    }

    const { ok, status, data } = await dodoFetch(
      `/customers/${customerId}/customer-portal/session`,
      { method: "POST", body: JSON.stringify({}) },
    );

    if (!ok) {
      console.error("Dodo customer portal failed:", status, JSON.stringify(data));
      return json({ error: "Could not open the billing portal. Please try again." }, 502);
    }

    const portalUrl = data?.link || data?.url || data?.portal_url || null;
    if (!portalUrl) {
      console.error("Dodo portal response missing URL:", JSON.stringify(data));
      return json({ error: "Billing portal URL was not returned." }, 502);
    }

    return json({ url: portalUrl });
  } catch (err) {
    console.error("dodo-portal error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
