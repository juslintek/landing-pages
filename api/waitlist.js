// Vercel serverless function — POST /api/waitlist
// Stores signups to Airtable if env vars are set, otherwise returns ok (frontend has localStorage fallback)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { email, venture } = req.body || {};
  if (!email || !venture) return res.status(400).json({ error: "email and venture required" });
  if (!email.includes("@")) return res.status(400).json({ error: "invalid email" });

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (apiKey && baseId) {
    try {
      const r = await fetch(`https://api.airtable.com/v0/${baseId}/Waitlist`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: { Email: email, Venture: venture, JoinedAt: new Date().toISOString() }
        }),
      });
      if (!r.ok) {
        const err = await r.text();
        console.error("Airtable error:", err);
      }
    } catch (e) {
      console.error("Airtable fetch failed:", e.message);
    }
  }

  return res.status(200).json({ status: "ok" });
}
