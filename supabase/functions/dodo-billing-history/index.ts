import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { adminClient, corsHeaders, dodoFetch, getAuthedUser, json } from "../_shared/dodo.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized: please sign in." }, 401);

    const admin = adminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("dodo_customer_id")
      .eq("id", user.id)
      .single();

    const customerId = profile?.dodo_customer_id || null;

    if (!customerId) {
      return json({ card: null, history: [] });
    }

    // Fetch payments list from Dodo Payments
    const { ok, status, data } = await dodoFetch(`/payments?customer_id=${customerId}`);

    if (!ok) {
      console.error("Dodo payments fetch failed:", status, JSON.stringify(data));
      return json({ error: "Could not fetch billing details from Dodo." }, 502);
    }

    const payments = Array.isArray(data) ? data : data?.data || [];
    
    // Parse payments history
    const history = payments.map((p: any) => ({
      id: p.payment_id || p.id,
      amount: (p.total_amount || 0) / 100,
      currency: (p.currency || "USD").toUpperCase(),
      status: p.status,
      date: p.created_at || new Date().toISOString(),
      invoiceUrl: p.invoice_url || p.invoice_pdf_url || null
    }));

    // Parse active/last payment card details
    const lastSuccess = payments.find((p: any) => p.status?.toLowerCase() === "succeeded");
    let card = null;

    if (lastSuccess) {
      const method = lastSuccess.payment_method || {};
      const cardData = lastSuccess.card_details || method.card || method || {};
      
      const last4 = cardData.card_last_four || cardData.last_four || cardData.last4 || null;
      const network = cardData.card_brand || cardData.card_network || cardData.network || cardData.brand || null;
      const holder = cardData.card_holder_name || cardData.holder_name || cardData.holder || lastSuccess.customer?.name || null;

      if (last4) {
        card = {
          last4,
          network: network ? network.toUpperCase() : "CARD",
          holder: holder || "Valued Customer"
        };
      }
    }

    return json({ card, history });
  } catch (err) {
    console.error("dodo-billing-history error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
