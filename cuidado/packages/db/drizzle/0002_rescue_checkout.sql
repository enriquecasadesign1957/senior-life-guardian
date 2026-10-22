ALTER TABLE "sites" ADD COLUMN "rescue_checkout_id" text;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_rescue_checkout_id_unique" UNIQUE("rescue_checkout_id");