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

type Body = {
  amountCents?: number;
  currency?: string;
  topicKey?: string;
  subject?: string;
  mins?: number;
  price?: number;
  location?: string;
  note?: string | null;
};

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
    return json(
      {
        error:
          "Server misconfigured: set STRIPE_SECRET_KEY (and ensure Supabase secrets exist)",
      },
      500,
    );
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

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const amountCents = Number(body.amountCents);
  const currency = (body.currency || "sgd").toLowerCase();
  const topicKey = String(body.topicKey || "").trim();
  const subject = String(body.subject || "").trim();
  const mins = Number(body.mins);
  const price = Number(body.price);
  const location = String(body.location || "").trim();
  const note =
    body.note == null || String(body.note).trim() === ""
      ? null
      : String(body.note).trim();

  if (!Number.isFinite(amountCents) || amountCents < 50) {
    return json({ error: "amountCents must be at least 50" }, 400);
  }
  if (currency !== "sgd") {
    return json({ error: "Only sgd is supported for PayNow" }, 400);
  }
  if (!topicKey || !subject) {
    return json({ error: "topicKey and subject are required" }, 400);
  }
  if (!Number.isFinite(mins) || mins <= 0) {
    return json({ error: "Invalid mins" }, 400);
  }
  if (!Number.isFinite(price) || price < 0) {
    return json({ error: "Invalid price" }, 400);
  }
  if (location !== "inperson" && location !== "video") {
    return json({ error: "Invalid location" }, 400);
  }

  const params = new URLSearchParams();
  params.set("amount", String(Math.round(amountCents)));
  params.set("currency", currency);
  params.append("payment_method_types[]", "paynow");
  params.set("payment_method_data[type]", "paynow");
  params.set("confirm", "true");
  params.set("return_url", "ping://payment-return");
  params.set("metadata[student_id]", user.id);
  params.set("metadata[topic_key]", topicKey);
  params.set("metadata[subject]", subject);
  params.set("metadata[mins]", String(mins));
  params.set("metadata[price]", String(price));
  params.set("metadata[location]", location);
  params.set("metadata[source]", "chaptr_booking");

  const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const pi = await stripeRes.json();
  if (!stripeRes.ok) {
    const msg =
      typeof pi?.error?.message === "string"
        ? pi.error.message
        : "Stripe PaymentIntent failed";
    return json({ error: msg }, 502);
  }

  const qr = pi?.next_action?.paynow_display_qr_code ?? {};
  const qrImageUrl = qr.image_url_png ?? null;
  const hostedInstructionsUrl = qr.hosted_instructions_url ?? null;

  if (!pi.id || !qrImageUrl) {
    return json(
      { error: "Stripe did not return a PayNow QR code", status: pi.status },
      502,
    );
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const { error: insertErr } = await admin.from("booking_payments").insert({
    student_id: user.id,
    stripe_payment_intent_id: pi.id,
    amount_cents: Math.round(amountCents),
    currency,
    status: pi.status === "succeeded" ? "succeeded" : "requires_action",
    topic_key: topicKey,
    subject,
    mins,
    price,
    location,
    note,
  });

  if (insertErr) {
    return json(
      { error: `Failed to record payment: ${insertErr.message}` },
      500,
    );
  }

  return json({
    paymentIntentId: pi.id,
    clientSecret: pi.client_secret,
    qrImageUrl,
    hostedInstructionsUrl,
    status: pi.status,
  });
});
