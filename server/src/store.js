const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

function createStore(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  let quotes = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : {};
  function persist() { const temporary = `${filePath}.tmp`; fs.writeFileSync(temporary, JSON.stringify(quotes, null, 2)); fs.renameSync(temporary, filePath); }
  return {
    create(input) { const now = new Date().toISOString(); const quote = { id: crypto.randomUUID(), quoteNumber: `JW-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`, status: "draft", createdAt: now, updatedAt: now, ...input }; quotes[quote.id] = quote; persist(); return quote; },
    get(id) { return quotes[id] || null; },
    update(id, patch) { if (!quotes[id]) return null; quotes[id] = { ...quotes[id], ...patch, updatedAt: new Date().toISOString() }; persist(); return quotes[id]; },
    list() { return Object.values(quotes).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); }
  };
}

module.exports = { createStore };
