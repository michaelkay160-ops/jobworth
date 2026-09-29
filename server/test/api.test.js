const test = require("node:test");
const assert = require("node:assert/strict");
const { server } = require("../src/index");

let baseUrl;
test.before(async () => { await new Promise(resolve => server.listen(0, "127.0.0.1", resolve)); baseUrl = `http://127.0.0.1:${server.address().port}`; });
test.after(async () => { await new Promise(resolve => server.close(resolve)); });

test("health and price-book endpoints respond", async () => {
  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).ok, true);
  const priceBook = await fetch(`${baseUrl}/api/price-book`);
  const body = await priceBook.json();
  assert.equal(priceBook.status, 200);
  assert.ok(body.tasks.length > 0);
});

test("creates and presents a quote with an immutable pricing snapshot", async () => {
  const createdResponse = await fetch(`${baseUrl}/api/quotes`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ customer: { name: "Test Customer", address: "1 Main Street" }, items: [{ taskId: "task-outlet-standard", quantity: 1, access: "standard" }] }) });
  const created = await createdResponse.json();
  assert.equal(createdResponse.status, 201);
  assert.equal(created.status, "draft");
  assert.equal(created.pricing.totals.totalMinor, 9500);
  const presentedResponse = await fetch(`${baseUrl}/api/quotes/${created.id}/present`, { method: "POST" });
  const presented = await presentedResponse.json();
  assert.equal(presentedResponse.status, 200);
  assert.equal(presented.status, "presented");
  assert.deepEqual(presented.pricingSnapshot, presented.pricing);
});
