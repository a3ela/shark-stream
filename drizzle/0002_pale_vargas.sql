ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "categories" CASCADE;--> statement-breakpoint
ALTER TABLE "requests" DROP CONSTRAINT "requests_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "sites" DROP CONSTRAINT "sites_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "requests" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "sites" DROP COLUMN "category_id";