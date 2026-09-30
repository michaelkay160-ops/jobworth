import { getCatalog } from "./catalog.js";
import { calculateQuote } from "./pricing.js";

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" }
});
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const quoteNumber = () => `JW-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,6).toUpperCase()}`;

async function readJson(request) {
  try { return await request.json(); } catch { throw new Error("Request body must be valid JSON"); }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { headers: {
      "access-control-allow-origin":"*", "access-control-allow-methods":"GET,POST,OPTIONS", "access-control-allow-headers":"content-type"
    }});

    try {
      if (url.pathname === "/api/health") return json({ ok: true, service: "jobworth-api", storage: "cloudflare-d1" });
      const catalog = getCatalog();
      if (url.pathname === "/api/price-book" && request.method === "GET") return json(catalog);

      if (url.pathname === "/api/quotes" && request.method === "GET") {
        const result = await env.DB.prepare("SELECT * FROM quotes ORDER BY created_at DESC LIMIT 100").all();
        return json(result.results.map(row => ({ ...row, customer: JSON.parse(row.customer_json), options: JSON.parse(row.options_json), lines: JSON.parse(row.lines_json), pricingSnapshot: row.pricing_snapshot_json ? JSON.parse(row.pricing_snapshot_json) : null })));
      }

      if (url.pathname === "/api/quotes" && request.method === "POST") {
        const input = await readJson(request);
        const tasksById = Object.fromEntries(catalog.tasks.map(task => [task.id, task]));
        const pricing = calculateQuote({ lines: input.lines || [], tasksById, options: input.options || {} });
        const timestamp = now(), quoteId = id(), number = quoteNumber();
        await env.DB.prepare(`INSERT INTO quotes (id, quote_number, status, customer_json, options_json, lines_json, pricing_snapshot_json, subtotal_minor, tax_minor, total_minor, created_at, updated_at) VALUES (?, ?, 'draft', ?, ?, ?, NULL, ?, ?, ?, ?, ?)`)
          .bind(quoteId, number, JSON.stringify(input.customer || {}), JSON.stringify(input.options || {}), JSON.stringify(input.lines || []), pricing.subtotalMinor, pricing.taxMinor, pricing.totalMinor, timestamp, timestamp).run();
        return json({ id: quoteId, quoteNumber: number, status: "draft", customer: input.customer || {}, lines: pricing.lines, pricing }, 201);
      }

      const match = url.pathname.match(/^\/api\/quotes\/([^/]+)(?:\/(present))?$/);
      if (match && request.method === "GET") {
        const row = await env.DB.prepare("SELECT * FROM quotes WHERE id = ?").bind(match[1]).first();
        if (!row) return json({ error: "Quote not found" }, 404);
        return json({ ...row, customer: JSON.parse(row.customer_json), options: JSON.parse(row.options_json), lines: JSON.parse(row.lines_json), pricingSnapshot: row.pricing_snapshot_json ? JSON.parse(row.pricing_snapshot_json) : null });
      }
      if (match && match[2] === "present" && request.method === "POST") {
        const row = await env.DB.prepare("SELECT * FROM quotes WHERE id = ?").bind(match[1]).first();
        if (!row) return json({ error: "Quote not found" }, 404);
        const snapshot = { capturedAt: now(), subtotalMinor: row.subtotal_minor, taxMinor: row.tax_minor, totalMinor: row.total_minor, lines: JSON.parse(row.lines_json), options: JSON.parse(row.options_json) };
        await env.DB.prepare("UPDATE quotes SET status='presented', pricing_snapshot_json=?, updated_at=? WHERE id=?").bind(JSON.stringify(snapshot), snapshot.capturedAt, match[1]).run();
        return json({ id: row.id, quoteNumber: row.quote_number, status: "presented", pricingSnapshot: snapshot });
      }
      return json({ error: "Not found" }, 404);
    } catch (error) {
      return json({ error: error.message || "Unexpected error" }, 400);
    }
  }
};
