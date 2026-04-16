function clean(value) {
  return String(value || "").trim();
}

function getBaseUrl() {
  const environment = clean(process.env.PAYPAL_ENV).toLowerCase();
  return environment === "live" || environment === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
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

async function paypalFetch(path, options = {}) {
  const clientId = clean(process.env.PAYPAL_CLIENT_ID);
  const clientSecret = clean(process.env.PAYPAL_CLIENT_SECRET);

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are missing.");
  }

  const tokenResponse = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || "Unable to authenticate with PayPal.");
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const detail = data?.details?.[0]?.description || data?.message || data?.name;
    throw new Error(detail || "PayPal request failed.");
  }

  return data;
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

export { clean, paypalFetch, readJson, sendJson };
