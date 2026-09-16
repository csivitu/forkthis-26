CREATE TABLE "resource_publications" (
	"section_id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"markdown" text NOT NULL,
	"published_by" uuid NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resource_publications_title_length_check" CHECK (char_length(trim("resource_publications"."title")) between 1 and 120),
	CONSTRAINT "resource_publications_slug_check" CHECK (char_length("resource_publications"."slug") between 1 and 80 and "resource_publications"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and "resource_publications"."slug" <> 'additional'),
	CONSTRAINT "resource_publications_markdown_check" CHECK (char_length(trim("resource_publications"."markdown")) > 0 and octet_length("resource_publications"."markdown") <= 65536)
);
--> statement-breakpoint
CREATE TABLE "resource_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"markdown" text NOT NULL,
	"position" integer NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resource_sections_title_length_check" CHECK (char_length(trim("resource_sections"."title")) between 1 and 120),
	CONSTRAINT "resource_sections_slug_check" CHECK (char_length("resource_sections"."slug") between 1 and 80 and "resource_sections"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and "resource_sections"."slug" <> 'additional'),
	CONSTRAINT "resource_sections_markdown_check" CHECK (char_length(trim("resource_sections"."markdown")) > 0 and octet_length("resource_sections"."markdown") <= 65536),
	CONSTRAINT "resource_sections_position_check" CHECK ("resource_sections"."position" >= 0)
);
--> statement-breakpoint
ALTER TABLE "resource_publications" ADD CONSTRAINT "resource_publications_section_id_resource_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."resource_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_publications" ADD CONSTRAINT "resource_publications_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_sections" ADD CONSTRAINT "resource_sections_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_sections" ADD CONSTRAINT "resource_sections_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "resource_publications_slug_unique" ON "resource_publications" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "resource_publications_published_by_idx" ON "resource_publications" USING btree ("published_by");--> statement-breakpoint
CREATE UNIQUE INDEX "resource_sections_slug_unique" ON "resource_sections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "resource_sections_position_idx" ON "resource_sections" USING btree ("position");--> statement-breakpoint
CREATE INDEX "resource_sections_created_by_idx" ON "resource_sections" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "resource_sections_updated_by_idx" ON "resource_sections" USING btree ("updated_by");