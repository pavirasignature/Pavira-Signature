-- Migration: Add isActive column to products table
-- Date: 2026-06-04
-- Description: Adds isActive boolean column to products table to match the controller expectations

-- Add isActive column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;

-- Set existing products to active by default
UPDATE products
SET "isActive" = true
WHERE "isActive" IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN products."isActive" IS 'Indicates whether the product is active and should be displayed';
