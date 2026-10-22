ALTER TABLE "sites" ADD COLUMN "last_probe_status" integer;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "last_probe_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "probe_streak" integer DEFAULT 0 NOT NULL;