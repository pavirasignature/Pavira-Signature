-- Adds a per-login session identifier (UUID) allotted to each user after authentication.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS "sessionId" UUID;
