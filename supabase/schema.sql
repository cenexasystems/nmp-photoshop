-- ==========================================
-- GOLDEN POS - SUPABASE SQL SCHEMA
-- ==========================================

-- We use an ENUM instead of a separate table for Branches to keep the schema simple and avoid unnecessary joins, 
-- while still ensuring data integrity (so someone can't accidentally type 'chennai-man').
CREATE TYPE branch_type AS ENUM ('chennai-main', 'bangalore-hub', 'mumbai-central');

-- ==========================================
-- 1. CUSTOMERS TABLE
-- ==========================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone VARCHAR(10) NOT NULL,
  branch_id branch_type NOT NULL,
  total_orders INT DEFAULT 0, -- Track number of orders per customer
  total_spent NUMERIC(10,2) DEFAULT 0, -- Track total revenue per customer
  last_order_date DATE, -- Track date of last order
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. ORDERS TABLE
-- ==========================================
CREATE TABLE orders (
  id TEXT PRIMARY KEY, -- e.g., INV-2026-4NPIP
  branch_id branch_type NOT NULL,
  customer_id UUID REFERENCES customers(id), -- Nullable for walk-ins without profiles
  customer_name TEXT, -- Stored directly in case customer profile is deleted or walk-in
  customer_phone VARCHAR(10),
  date DATE NOT NULL,
  staff_name TEXT,
  source TEXT, -- 'ONLINE' or 'OFFLINE'
  total NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  payment_status TEXT, -- 'Paid', 'Unpaid', 'Partial'
  payment_mode TEXT, -- 'Cash', 'GPay', etc.
  delivery_status TEXT, -- 'Pending', 'Delivered'
  discount NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  status_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. ORDER ITEMS TABLE (Cart)
-- ==========================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product TEXT NOT NULL,
  details TEXT,
  amount NUMERIC(10,2) NOT NULL,
  cost_to_make NUMERIC(10,2) DEFAULT 0,
  id_number TEXT,
  delivery_date DATE
);

-- ==========================================
-- 4. EXPENSES TABLE
-- ==========================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id branch_type NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_mode TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TRIGGERS
-- ==========================================
-- Trigger to automatically increment 'total_orders' in the customers table 
-- whenever a new order is linked to a customer.
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE customers
    SET 
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total,
      last_order_date = GREATEST(COALESCE(last_order_date, '1970-01-01'::DATE), NEW.date)
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_created
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION update_customer_stats();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Note: These policies assume that you are using Supabase Auth and passing custom claims 
-- in your JWT tokens (e.g., 'user_role' = 'admin' or 'staff', and 'branch_id' = 'chennai-main').

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Customers Policies
CREATE POLICY "Admin can see all customers"
ON customers FOR ALL
USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Staff can see branch customers"
ON customers FOR ALL
USING (auth.jwt() ->> 'user_role' = 'staff' AND branch_id::text = auth.jwt() ->> 'branch_id');

-- Orders Policies
CREATE POLICY "Admin can see all orders"
ON orders FOR ALL
USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Staff can see branch orders"
ON orders FOR ALL
USING (auth.jwt() ->> 'user_role' = 'staff' AND branch_id::text = auth.jwt() ->> 'branch_id');

-- Order Items Policies
CREATE POLICY "Admin can see all order items"
ON order_items FOR ALL
USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Staff can see branch order items"
ON order_items FOR ALL
USING (
  auth.jwt() ->> 'user_role' = 'staff' AND 
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.branch_id::text = auth.jwt() ->> 'branch_id'
  )
);

-- Expenses Policies
CREATE POLICY "Admin can see all expenses"
ON expenses FOR ALL
USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Staff can see branch expenses"
ON expenses FOR ALL
USING (auth.jwt() ->> 'user_role' = 'staff' AND branch_id::text = auth.jwt() ->> 'branch_id');

-- ==========================================
-- 5. PAYMENTS TABLE (Ledger)
-- ==========================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_mode TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can see all payments"
ON payments FOR ALL
USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Staff can see branch payments"
ON payments FOR ALL
USING (
  auth.jwt() ->> 'user_role' = 'staff' AND 
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = payments.order_id 
    AND orders.branch_id::text = auth.jwt() ->> 'branch_id'
  )
);
