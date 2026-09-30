CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  customer_json TEXT NOT NULL,
  options_json TEXT NOT NULL,
  lines_json TEXT NOT NULL,
  pricing_snapshot_json TEXT,
  subtotal_minor INTEGER NOT NULL,
  tax_minor INTEGER NOT NULL,
  total_minor INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
