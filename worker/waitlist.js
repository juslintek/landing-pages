export default {
  async fetch(request, env) {
    if (request.method !== "POST") return json({ error: "POST only" }, 405);

    const { email, venture } = await request.json();
    if (!email || !venture) return json({ error: "email and venture required" }, 400);
    if (!email.includes("@")) return json({ error: "invalid email" }, 400);

    const key = `${venture}:${email.toLowerCase()}`;
    const existing = await env.WAITLIST.get(key);
    if (existing) return json({ status: "already_registered" });

    await env.WAITLIST.put(key, JSON.stringify({ email, venture, joined_at: new Date().toISOString() }));

    // Count per venture
    const countKey = `count:${venture}`;
    const count = parseInt(await env.WAITLIST.get(countKey) || "0") + 1;
    await env.WAITLIST.put(countKey, String(count));

    return json({ status: "ok", position: count });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}
