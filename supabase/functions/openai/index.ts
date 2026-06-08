import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Resolve the authenticated Supabase user from the request's Authorization header.
 * Returns null for missing/invalid tokens AND for the public anon key (which carries
 * no user). This is what prevents anonymous callers from draining the paid OpenAI API
 * using the publicly-shipped anon key.
 */
async function getAuthedUser(req: Request) {
  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
  if (!supabaseUrl || !anonKey) {
    console.error("Auth check skipped: SUPABASE_URL / SUPABASE_ANON_KEY not available in function env.")
    return null
  }

  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── Require an authenticated user ──────────────────────────────────────────
    // The OpenAI API costs money per call, so only signed-in app users may invoke it.
    const user = await getAuthedUser(req)
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: you must be signed in to use AI features." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY")
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: OPENAI_API_KEY is not set." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { messages, temperature, max_tokens } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'messages' parameter." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // ── Server-side credit enforcement ─────────────────────────────────────────
    // Credits/plan are read and mutated with the service-role key so the database
    // trigger (which blocks client-side edits to plan/ai_credits) lets these through.
    // This is the authoritative gate — the client cannot bypass it.
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: Supabase service role not available." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("plan, ai_credits")
      .eq("id", user.id)
      .single()

    if (profileErr || !profile) {
      console.error("Failed to load profile for credit check:", profileErr)
      return new Response(
        JSON.stringify({ error: "Could not verify your plan. Please try again.", code: "profile_unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const plan = String(profile.plan || "Free").toLowerCase()
    const isFree = plan === "free"
    const isPro = plan === "pro"
    const CREDIT_COST = 1

    if (isFree) {
      return new Response(
        JSON.stringify({
          error: "AI features aren't available on the Free plan. Upgrade your plan to use the AI.",
          code: "no_ai_access",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Reserve a credit BEFORE calling OpenAI so an aborted/raced request can't dodge the
    // charge. consume_ai_credits decrements atomically only if enough remain, returning the
    // new balance or NULL when the user is out of credits.
    let creditsRemaining: number | null = null
    if (!isPro) {
      const { data: remaining, error: consumeErr } = await admin.rpc("consume_ai_credits", {
        p_user_id: user.id,
        p_amount: CREDIT_COST,
      })

      if (consumeErr) {
        console.error("consume_ai_credits failed:", consumeErr)
        return new Response(
          JSON.stringify({ error: "Could not reserve AI credits. Please try again.", code: "credit_error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      if (remaining === null || remaining === undefined) {
        // No row updated → insufficient credits.
        return new Response(
          JSON.stringify({
            error: "You're out of AI credits. Upgrade your plan to get more.",
            code: "out_of_credits",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      creditsRemaining = remaining as number
    }

    const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens
      })
    })

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      console.error("OpenAI API call failed:", errorText)
      // Refund the reserved credit since the user got nothing.
      if (!isPro) {
        const { error: refundErr } = await admin.rpc("refund_ai_credits", {
          p_user_id: user.id,
          p_amount: CREDIT_COST,
        })
        if (refundErr) console.error("refund_ai_credits failed:", refundErr)
      }
      return new Response(
        JSON.stringify({ error: `OpenAI API returned an error: ${apiResponse.status} ${errorText}` }),
        { status: apiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const data = await apiResponse.json()
    // Surface the authoritative remaining balance so the client UI can update without a reload.
    if (creditsRemaining !== null) {
      data.credits_remaining = creditsRemaining
    }
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Error in openai edge function:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
