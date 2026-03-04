export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // POST /waitlist
    if (request.method === 'POST' && pathname === '/waitlist') {
      let body;
      try {
        body = await request.json();
      } catch {
        return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400, headers: cors });
      }

      const { email, venture } = body;
      if (!email || !venture) {
        return Response.json({ ok: false, error: 'email and venture are required' }, { status: 400, headers: cors });
      }

      const key = `${venture}:${email}`;
      await env.WAITLIST.put(key, JSON.stringify({ email, venture, ts: Date.now() }));

      // increment count
      const countKey = `count:${venture}`;
      const current = parseInt((await env.WAITLIST.get(countKey)) ?? '0', 10);
      await env.WAITLIST.put(countKey, String(current + 1));

      return Response.json({ ok: true }, { headers: cors });
    }

    // GET /waitlist/count/:venture
    const countMatch = pathname.match(/^\/waitlist\/count\/([^/]+)$/);
    if (request.method === 'GET' && countMatch) {
      const venture = countMatch[1];
      const count = parseInt((await env.WAITLIST.get(`count:${venture}`)) ?? '0', 10);
      return Response.json({ count }, { headers: cors });
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: cors });
  },
};
