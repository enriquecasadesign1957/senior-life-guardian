CREATE TYPE "public"."cleanup_batch_status" AS ENUM('applied', 'undone');--> statement-breakpoint
CREATE TABLE "cleanup_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"plugin_batch_id" text NOT NULL,
	"status" "cleanup_batch_status" DEFAULT 'applied' NOT NULL,
	"revisions" integer DEFAULT 0 NOT NULL,
	"expired_transients" integer DEFAULT 0 NOT NULL,
	"spam_comments" integer DEFAULT 0 NOT NULL,
	"bytes" integer DEFAULT 0 NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"undo_until" timestamp with time zone NOT NULL,
	"undone_at" timestamp with time zone,
	CONSTRAINT "cleanup_batches_plugin_batch_id_unique" UNIQUE("plugin_batch_id")
);
--> statement-breakpoint
ALTER TABLE "cleanup_batches" ADD CONSTRAINT "cleanup_batches_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cleanup_batches_site_applied" ON "cleanup_batches" USING btree ("site_id","applied_at");--> statement-breakpoint
CREATE INDEX "cleanup_batches_site_undo" ON "cleanup_batches" USING btree ("site_id","undo_until");
