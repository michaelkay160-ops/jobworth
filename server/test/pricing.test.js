const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateLine, calculateQuote, DEFAULT_PROFILE } = require("../src/pricing");

const task = { id: "outlet", laborHours: 0.5, materialCostMinor: 750 };

test("calculates and rounds a standard line item", () => {
  const line = calculateLine(task, 1, "standard");
  assert.equal(line.sellPriceMinor, 9500);
  assert.equal(line.laborHours, 0.5);
});

test("difficult access increases labor and price", () => {
  const standard = calculateLine(task, 1, "standard");
  const difficult = calculateLine(task, 1, "difficult");
  assert.equal(difficult.laborHours, 1);
  assert.ok(difficult.sellPriceMinor > standard.sellPriceMinor);
});

test("quote totals combine lines and retain the currency", () => {
  const quote = calculateQuote([{ taskId: "outlet", quantity: 2, access: "standard" }], new Map([[task.id, task]]), DEFAULT_PROFILE);
  assert.equal(quote.currency, "USD");
  assert.equal(quote.totals.totalMinor, 19000);
  assert.equal(quote.lines.length, 1);
});

test("rejects invalid quantity and missing work", () => {
  assert.throws(() => calculateLine(task, 0), /positive integer/);
  assert.throws(() => calculateQuote([], new Map([[task.id, task]])), /at least one task/);
});
