ALTER TABLE "users" ADD COLUMN "agency_trial_seats" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "agency_trial_activated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "agency_seat" boolean DEFAULT false NOT NULL;
