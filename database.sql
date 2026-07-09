-- ==========================================
-- PAVIRA SIGNATURE - SUPABASE SCHEMA SETUP
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255) DEFAULT '',
    "order" INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "googleId" VARCHAR(255) UNIQUE,
    phone VARCHAR(50) DEFAULT '',
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    "isBlocked" BOOLEAN DEFAULT false,
    "isVerified" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    addresses JSONB DEFAULT '[]'::jsonb,
    cart JSONB DEFAULT '[]'::jsonb,
    "verificationToken" VARCHAR(255),
    "resetPasswordToken" VARCHAR(255),
    "resetPasswordExpire" TIMESTAMP WITH TIME ZONE,
    "lastLogin" TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    "compareAtPrice" DECIMAL(10,2),
    "category" UUID REFERENCES categories(id) ON DELETE SET NULL,
    stock INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    "numReviews" INTEGER DEFAULT 0,
    image VARCHAR(255),
    images JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '{}'::jsonb,
    featured BOOLEAN DEFAULT false,
    trending BOOLEAN DEFAULT false,
    "bestSeller" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    "discountType" VARCHAR(50) CHECK ("discountType" IN ('percentage', 'fixed')),
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "minPurchase" DECIMAL(10,2) DEFAULT 0.0,
    "maxDiscount" DECIMAL(10,2),
    "expiryDate" TIMESTAMP WITH TIME ZONE,
    "usageLimit" INTEGER,
    "usageCount" INTEGER DEFAULT 0,
    "usedBy" JSONB DEFAULT '[]'::jsonb,
    "isActive" BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderNumber" VARCHAR(100) UNIQUE NOT NULL,
    "user" UUID REFERENCES users(id) ON DELETE CASCADE,
    "orderStatus" VARCHAR(50) DEFAULT 'pending' CHECK ("orderStatus" IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    items JSONB NOT NULL,
    "itemsPrice" DECIMAL(10,2) NOT NULL,
    "taxPrice" DECIMAL(10,2) NOT NULL,
    "shippingPrice" DECIMAL(10,2) NOT NULL,
    "discountPrice" DECIMAL(10,2) DEFAULT 0.0,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "shippingAddress" JSONB NOT NULL,
    "paymentMethod" VARCHAR(50) NOT NULL,
    "isPaid" BOOLEAN DEFAULT false,
    "paidAt" TIMESTAMP WITH TIME ZONE,
    "paymentInfo" JSONB,
    tracking JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Wishlists Table (Join Table)
CREATE TABLE IF NOT EXISTS wishlists (
    "user" UUID REFERENCES users(id) ON DELETE CASCADE,
    product UUID REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY ("user", product),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Redirects Table
CREATE TABLE IF NOT EXISTS redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "oldPath" VARCHAR(500) NOT NULL UNIQUE,
    "newPath" VARCHAR(500) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Atomic Stock Decrement RPC
-- Safely decrements product stock to prevent race conditions during checkout
CREATE OR REPLACE FUNCTION decrement_product_stock(p_id UUID, qty INTEGER)
RETURNS VOID AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Select the stock for update (row-level lock)
    SELECT stock INTO current_stock FROM products WHERE id = p_id FOR UPDATE;

    IF current_stock IS NULL THEN
        RAISE EXCEPTION 'Product not found';
    END IF;

    IF current_stock < qty THEN
        RAISE EXCEPTION 'Insufficient stock';
    END IF;

    -- Update stock
    UPDATE products SET stock = stock - qty WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
