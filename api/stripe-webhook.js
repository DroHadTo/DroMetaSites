import Stripe from "stripe";

function clean(value) {
  return String(value || "").trim();
}

async function getRawBody(req) {
  if (req.body && typeof req.body !== "string") {
    throw new Error("Body already parsed — disable body parsing for this route.");
  }

  if (typeof req.body === "string") {
    return Buffer.from(req.body, "utf8");
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

async function notifyAdmin(payload) {
  const adminUrl = clean(process.env.ADMIN_WEBHOOK_URL);

  if (!adminUrl) return;

  try {
    await fetch(adminUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": clean(process.env.ADMIN_WEBHOOK_SECRET),
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-fatal — Stripe already has the event
  }
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const secretKey = clean(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = clean(process.env.STRIPE_WEBHOOK_SECRET);

  if (!secretKey || !webhookSecret) {
    return res.status(500).json({ error: "Stripe webhook is not configured." });
  }

  let rawBody;

  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    return res.status(400).json({ error: "Could not read request body." });
  }

  const signature = req.headers["stripe-signature"];

  let event;

  try {
    const stripe = new Stripe(secretKey);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature invalid: ${err.message}` });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const meta = intent.metadata || {};

    const order = {
      event: "order.paid",
      paymentIntentId: intent.id,
      amount: intent.amount / 100,
      currency: intent.currency.toUpperCase(),
      packageId: meta.packageId || "",
      packageName: meta.packageName || "",
      customerName: meta.customerName || "",
      customerEmail: meta.customerEmail || intent.receipt_email || "",
      brand: meta.brand || "",
      paidAt: new Date(intent.created * 1000).toISOString(),
    };

    await notifyAdmin(order);
  }

  return res.status(200).json({ received: true });
}
