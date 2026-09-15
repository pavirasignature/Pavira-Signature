-- Phase 4 Indexes for Performance and Pagination

-- 1. Index on products for category and featured flags to speed up homepage queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products("isActive");

-- 2. Composite index on orders for filtering by user and sorting by created_at (common in getOrders)
CREATE INDEX IF NOT EXISTS idx_orders_user_created_at ON orders("user", created_at DESC);

-- 3. Index on coupons for rapid lookups during checkout
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- 4. Index for cart sessions (already tracked via users table in our architecture, but indexing the email/token/id)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
