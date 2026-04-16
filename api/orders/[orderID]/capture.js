import { clean, paypalFetch, sendJson } from "../../_paypal.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const orderID = clean(req.query.orderID);

    if (!orderID) {
      return sendJson(res, 400, { error: "Missing order id." });
    }

    const capture = await paypalFetch(`/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    return sendJson(res, 200, {
      id: orderID,
      status: capture.status || "COMPLETED",
      payer: capture.payer || null,
      amount: capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount || null,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unable to capture PayPal order.",
    });
  }
}
