import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function mapStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "succeeded":
      return "succeeded";
    case "canceled":
      return "canceled";
    case "processing":
      return "processing";
    case "requires_payment_method":
      return "requires_payment_method";
    case "requires_action":
    case "requires_confirmation":
    case "requires_capture":
      return "requires_action";
    default:
      return stripeStatus === "failed" ? "failed" : "requires_action";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!stripeKey || !supabaseUrl || !serviceKey || !anonKey) {
    return json({ error: "Server misconfigured" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing Authorization" }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return json({ error: "Unauthorized" }, 401);
  }

  let paymentIntentId = "";
  try {
    const body = await req.json();
    paymentIntentId = String(body?.paymentIntentId || "").trim();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!paymentIntentId.startsWith("pi_")) {
    return json({ error: "paymentIntentId required" }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: row, error: rowErr } = await admin
    .from("booking_payments")
    .select("id, student_id, status, tutoring_request_id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (rowErr) {
    return json({ error: rowErr.message }, 500);
  }
  if (!row || row.student_id !== user.id) {
    return json({ error: "Payment not found" }, 404);
  }

  const stripeRes = await fetch(
    `https://api.stripe.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`,
    {
      headers: { Authorization: `Bearer ${stripeKey}` },
    },
  );
  const pi = await stripeRes.json();
  if (!stripeRes.ok) {
    const msg =
      typeof pi?.error?.message === "string"
        ? pi.error.message
        : "Failed to retrieve PaymentIntent";
    return json({ error: msg }, 502);
  }

  let status = mapStatus(String(pi.status || ""));
  // Treat Stripe "last_payment_error" as failed when not succeeded
  if (
    status !== "succeeded" &&
    status !== "canceled" &&
    pi.last_payment_error
  ) {
    status = "failed";
  }

  if (status !== row.status) {
    await admin
      .from("booking_payments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", row.id);
  }

  return json({
    paymentIntentId,
    status,
    tutoringRequestId: row.tutoring_request_id,
  });
});
