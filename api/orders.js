import { packageCatalog } from "../src/data/site.js";
import { clean, paypalFetch, readJson, sendJson } from "./_paypal.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const body = await readJson(req);
    const packageId = clean(body.packageId);
    const customer = body.customer || {};
    const selectedPackage = packageCatalog.find((item) => item.id === packageId);

    if (!selectedPackage) {
      return sendJson(res, 400, { error: "Invalid package selected." });
    }

    const name = clean(customer.name);
    const email = clean(customer.email);
    const brand = clean(customer.brand);

    const order = await paypalFetch("/v2/checkout/orders", {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: `${selectedPackage.name} by DroMetaSites`,
            custom_id: selectedPackage.id,
            amount: {
              currency_code: "USD",
              value: selectedPackage.price.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "DroMetaSites",
          landing_page: "BILLING",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
        },
        payer: {
          name: name ? { given_name: name.split(" ")[0] } : undefined,
          email_address: email || undefined,
        },
      }),
    });

    return sendJson(res, 200, {
      id: order.id,
      packageId: selectedPackage.id,
      brand,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unable to create PayPal order.",
    });
  }
}
