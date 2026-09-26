-- Baba-Jay Spare Parts — database schema
--
-- Design note: line items (what's inside a sale, purchase order, or
-- quotation) are stored as JSONB arrays on the parent row, rather than
-- fully normalized into separate line-item tables. This matches the
-- shape your frontend mock data already used (sale.items = [...]),
-- so almost no data-transformation code is needed when swapping mock
-- data for real API calls. It's a deliberate simplicity trade-off for
-- an app this size — if you later need deep reporting across
-- individual line items, normalizing sale_items into its own table
-- is the natural next evolution, not a rewrite.

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Salesperson', 'StockManager', 'Cashier')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE parts (
  id SERIAL PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 5,
  oem_number TEXT,
  cross_ref JSONB NOT NULL DEFAULT '[]',            -- ["D1234", "GDB3389"]
  location TEXT,
  compatible_vehicles JSONB NOT NULL DEFAULT '[]',   -- repurposed: recommended surfaces, e.g. ["Wall", "Wood"] — column name kept as-is to match the frontend's existing field name
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  balance_owed NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  parts_supplied JSONB NOT NULL DEFAULT '[]',
  amount_owed NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE purchases (
  id TEXT PRIMARY KEY,                    -- e.g. 'PO-1001'
  supplier_id INTEGER REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL,
  items JSONB NOT NULL,                   -- [{partId, name, qty, cost}]
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Received')),
  total_cost NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sales (
  id TEXT PRIMARY KEY,                    -- e.g. 'INV-1725...'
  customer TEXT NOT NULL,
  items JSONB NOT NULL,                   -- [{id, name, price, qty}]
  payment_method TEXT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  change NUMERIC(10, 2) NOT NULL DEFAULT 0,
  performed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quotations (
  id TEXT PRIMARY KEY,                    -- e.g. 'QUO-1001'
  customer TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Converted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE returns (
  id TEXT PRIMARY KEY,
  invoice_id TEXT REFERENCES sales(id),
  part_id INTEGER REFERENCES parts(id),
  part_name TEXT NOT NULL,
  qty INTEGER NOT NULL,
  reason TEXT NOT NULL,
  refund_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Approved',
  performed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Every stock-changing event across the whole app writes here —
-- sales, purchases received, returns, manual adjustments. This one
-- table is what powers both the Inventory page's movement log and
-- the full Audit page.
CREATE TABLE stock_movements (
  id SERIAL PRIMARY KEY,
  part_id INTEGER REFERENCES parts(id),
  part_name TEXT NOT NULL,
  change INTEGER NOT NULL,               -- positive = increase, negative = decrease
  type TEXT NOT NULL CHECK (type IN ('sale', 'purchase', 'return', 'increase', 'decrease')),
  reason TEXT,
  performed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Useful indexes for the searches/filters the frontend already does
CREATE INDEX idx_parts_name ON parts (name);
CREATE INDEX idx_parts_barcode ON parts (barcode);
CREATE INDEX idx_stock_movements_part ON stock_movements (part_id);
CREATE INDEX idx_sales_created_at ON sales (created_at);
