ALTER TABLE "users" ADD COLUMN "agency_trial_seats" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "agency_trial_activated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "agency_trial_code_id" uuid;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "agency_seat" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE TABLE "agency_invite_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"seats" integer DEFAULT 5 NOT NULL,
	"max_uses" integer DEFAULT 1 NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agency_invite_codes_code_unique" UNIQUE("code")
);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_agency_trial_code_id_agency_invite_codes_id_fk" FOREIGN KEY ("agency_trial_code_id") REFERENCES "public"."agency_invite_codes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
INSERT INTO "agency_invite_codes" ("code", "seats", "max_uses") VALUES ('CW-AGENCIA-5', 5, 1);
