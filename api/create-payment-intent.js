import Stripe from "stripe";
import { packageCatalog } from "../src/data/site.js";

function clean(value) {
  return String(value || "").trim();
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string" && req.body.trim()) {
    return JSON.parse(req.body);
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const secretKey = clean(process.env.STRIPE_SECRET_KEY);

  if (!secretKey) {
    return res.status(500).json({ error: "Stripe is not configured." });
  }

  try {
    const body = await readJson(req);
    const packageId = clean(body.packageId);
    const customer = body.customer || {};

    const selectedPackage = packageCatalog.find((item) => item.id === packageId);

    if (!selectedPackage) {
      return res.status(400).json({ error: "Invalid package selected." });
    }

    const stripe = new Stripe(secretKey);

    const email = clean(customer.email);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(selectedPackage.price * 100),
      currency: "usd",
      description: `${selectedPackage.name} by DroMetaSites`,
      metadata: {
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        customerName: clean(customer.name),
        customerEmail: email,
        brand: clean(customer.brand),
      },
      receipt_email: email || undefined,
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      packageId: selectedPackage.id,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to create payment intent.",
    });
  }
}
