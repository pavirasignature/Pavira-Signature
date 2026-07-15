-- Migration: Create redirects table
-- Date: 2026-07-15
-- Description: Creates redirects table for URL path redirections (old path to new path mappings)

-- Create redirects table
CREATE TABLE IF NOT EXISTS "public"."redirects" (
  "id" BIGSERIAL PRIMARY KEY,
  "oldPath" TEXT NOT NULL UNIQUE,
  "newPath" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT "redirects_oldPath_key" UNIQUE ("oldPath")
);

-- Enable RLS for redirects table
ALTER TABLE "public"."redirects" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to redirects"
  ON "public"."redirects"
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to manage redirects (admin only in practice)
CREATE POLICY "Allow authenticated users to manage redirects"
  ON "public"."redirects"
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create index on oldPath for faster lookups
CREATE INDEX IF NOT EXISTS "idx_redirects_oldPath" ON "public"."redirects"("oldPath");

-- Create index on isActive for filtering active redirects
CREATE INDEX IF NOT EXISTS "idx_redirects_isActive" ON "public"."redirects"("isActive");

-- Add comment to table
COMMENT ON TABLE "public"."redirects" IS 'Stores URL path redirections for maintaining links and SEO';
COMMENT ON COLUMN "public"."redirects"."oldPath" IS 'The old path that users might access';
COMMENT ON COLUMN "public"."redirects"."newPath" IS 'The new path to redirect to';
COMMENT ON COLUMN "public"."redirects"."isActive" IS 'Whether this redirect is currently active';
