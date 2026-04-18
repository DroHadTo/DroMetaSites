import { createClient } from "@supabase/supabase-js";

function clean(value) {
  return String(value ?? "").trim();
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) return JSON.parse(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const supabaseUrl = clean(process.env.SUPABASE_URL);
  const supabaseServiceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: "Server misconfigured." });
  }

  try {
    const body = await readJson(req);

    const { error } = await createClient(supabaseUrl, supabaseServiceKey)
      .from("leads")
      .insert({
        customer_name:  clean(body.name),
        customer_email: clean(body.email),
        brand:          clean(body.brand),
        website:        clean(body.website),
        timeline:       clean(body.timeline),
        goals:          clean(body.goals),
        pages:          clean(body.pages),
        notes:          clean(body.notes),
        package_id:     clean(body.packageId),
        package_name:   clean(body.packageName),
        status:         "hot_lead",
        source:         "drometasites",
      });

    if (error) {
      console.error("Supabase lead insert failed:", error.message);
      return res.status(500).json({ error: "Failed to save lead." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("submit-lead error:", err.message);
    return res.status(500).json({ error: "Internal error." });
  }
}
