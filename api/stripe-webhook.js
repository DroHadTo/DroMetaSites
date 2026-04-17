import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

function clean(value) {
  return String(value ?? "").trim();
}

async function getRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body, "utf8");
  if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
    return Buffer.from(JSON.stringify(req.body));
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const secretKey = clean(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = clean(process.env.STRIPE_WEBHOOK_SECRET);
  const supabaseUrl = clean(process.env.SUPABASE_URL);
  const supabaseServiceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!secretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error("Missing env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Webhook is not configured." });
  }

  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch {
    return res.status(400).json({ error: "Could not read request body." });
  }

  const signature = req.headers["stripe-signature"];
  let event;
  try {
    const stripe = new Stripe(secretKey, { apiVersion: "2024-04-10" });
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature failure:", err.message);
    return res.status(400).json({ error: `Webhook signature invalid: ${err.message}` });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const meta = intent.metadata || {};

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from("sales").insert({
      customer_name: clean(meta.customerName),
      customer_email: clean(meta.customerEmail) || clean(intent.receipt_email),
      brand: "drometasites",
      package_name: clean(meta.packageName),
      package_id: clean(meta.packageId),
      amount: intent.amount,
      currency: intent.currency,
      payment_intent_id: intent.id,
      status: "new",
      paid_at: new Date(intent.created * 1000).toISOString(),
    });

    if (error) {
      console.error("Supabase insert failed:", error.message);
    } else {
      console.log("Sale recorded:", intent.id);
    }
  }

  return res.status(200).json({ received: true });
}
