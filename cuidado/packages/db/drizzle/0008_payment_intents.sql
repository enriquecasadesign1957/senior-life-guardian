CREATE TABLE IF NOT EXISTS "payment_intents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "purpose" text NOT NULL,
  "site_id" uuid NOT NULL REFERENCES "sites"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "buy_order" text NOT NULL UNIQUE,
  "amount_clp" integer,
  "status" text DEFAULT 'pending' NOT NULL,
  "tbk_token" text,
  "tbk_user" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "paid_at" timestamp with time zone
);

ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "tbk_user" text;
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "tbk_username" text;
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "plan_renewal_at" timestamp with time zone;
