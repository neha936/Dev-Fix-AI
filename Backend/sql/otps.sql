-- Idempotent fix for the "otps" table. Matches src/db/schema.js (camelCase, quoted column names).
-- Safe to run more than once: creates the table if missing, otherwise adds any missing columns.

CREATE TABLE IF NOT EXISTS "otps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(255) NOT NULL,
  "otpHash" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "verified" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "otps" ADD COLUMN IF NOT EXISTS "email" varchar(255);
ALTER TABLE "otps" ADD COLUMN IF NOT EXISTS "otpHash" text;
ALTER TABLE "otps" ADD COLUMN IF NOT EXISTS "expiresAt" timestamp;
ALTER TABLE "otps" ADD COLUMN IF NOT EXISTS "attempts" integer DEFAULT 0 NOT NULL;
ALTER TABLE "otps" ADD COLUMN IF NOT EXISTS "verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "otps" ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT now() NOT NULL;
