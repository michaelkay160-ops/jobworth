const http = require("node:http");
const path = require("node:path");
const { loadCatalog } = require("./catalog");
const { DEFAULT_PROFILE, calculateQuote } = require("./pricing");
const { createStore } = require("./store");

const port = Number(process.env.PORT || 3000);
const catalog = loadCatalog();
const store = createStore(path.resolve(__dirname, "../.data/quotes.json"));

function send(response, status, body) { response.writeHead(status, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" }); response.end(JSON.stringify(body)); }
function readJson(request) { return new Promise((resolve, reject) => { let body = ""; request.on("data", chunk => { body += chunk; if (body.length > 1_000_000) reject(new Error("Request body too large")); }); request.on("end", () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error("Request body must be valid JSON")); } }); request.on("error", reject); }); }
function normalizeItems(items) { if (!Array.isArray(items)) throw new Error("items must be an array"); return items.map(item => ({ taskId: String(item.taskId), quantity: Number(item.quantity || 1), access: item.access || "standard" })); }
function validateCustomer(customer) { if (!customer || !String(customer.name || "").trim() || !String(customer.address || "").trim()) throw new Error("customer.name and customer.address are required"); }

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") { response.writeHead(204, { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type" }); return response.end(); }
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  try {
    if (request.method === "GET" && url.pathname === "/api/health") return send(response, 200, { ok: true, service: "jobworth-api" });
    if (request.method === "GET" && url.pathname === "/api/price-book") return send(response, 200, { categories: catalog.categories, tasks: catalog.tasks, profile: DEFAULT_PROFILE });
    if (request.method === "GET" && url.pathname === "/api/quotes") return send(response, 200, { quotes: store.list() });
    if (request.method === "POST" && url.pathname === "/api/quotes") {
      const input = await readJson(request); validateCustomer(input.customer); const items = normalizeItems(input.items); const pricing = calculateQuote(items, catalog.tasksById, DEFAULT_PROFILE); const quote = store.create({ customer: input.customer, project: input.project || "Electrical service quote", notes: input.notes || "", items, pricing, priceBookVersion: "seed-v1" }); return send(response, 201, quote);
    }
    const match = url.pathname.match(/^\/api\/quotes\/([^/]+)(?:\/(present))?$/);
    if (match && request.method === "GET") { const quote = store.get(match[1]); return quote ? send(response, 200, quote) : send(response, 404, { error: "Quote not found" }); }
    if (match && match[2] === "present" && request.method === "POST") { const quote = store.get(match[1]); if (!quote) return send(response, 404, { error: "Quote not found" }); if (quote.status === "presented") return send(response, 200, quote); const presented = store.update(match[1], { status: "presented", presentedAt: new Date().toISOString(), pricingSnapshot: quote.pricing }); return send(response, 200, presented); }
    return send(response, 404, { error: "Not found" });
  } catch (error) { return send(response, 400, { error: error.message }); }
});

if (require.main === module) server.listen(port, () => console.log(`JobWorth API listening on http://localhost:${port}`));
module.exports = { server };
