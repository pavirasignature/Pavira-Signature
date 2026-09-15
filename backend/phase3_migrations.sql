-- 1. Create carts table
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id) -- A user can only have one active cart
);

-- 2. Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(cart_id, product_id)
);

-- 3. Create inventory_reservations table
CREATE TABLE IF NOT EXISTS inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Update orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255) UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- 5. RPC to reserve inventory safely
CREATE OR REPLACE FUNCTION reserve_inventory(p_session_id VARCHAR, p_product_id UUID, p_quantity INTEGER, p_duration_mins INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_stock INTEGER;
    v_reserved_stock INTEGER;
BEGIN
    -- Lock the product row
    SELECT stock INTO v_current_stock FROM products WHERE id = p_product_id FOR UPDATE;

    IF v_current_stock IS NULL THEN
        RETURN FALSE; -- Product not found
    END IF;

    -- Calculate active reservations
    SELECT COALESCE(SUM(quantity), 0) INTO v_reserved_stock
    FROM inventory_reservations
    WHERE product_id = p_product_id AND expires_at > NOW();

    IF (v_current_stock - v_reserved_stock) >= p_quantity THEN
        -- We have enough stock, create reservation
        INSERT INTO inventory_reservations (session_id, product_id, quantity, expires_at)
        VALUES (p_session_id, p_product_id, p_quantity, NOW() + (p_duration_mins || ' minutes')::INTERVAL);
        RETURN TRUE;
    ELSE
        RETURN FALSE; -- Insufficient stock
    END IF;
END;
$$ LANGUAGE plpgsql;
