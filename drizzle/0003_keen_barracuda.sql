DROP TABLE "accounts" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "auth_provider" varchar(20) NOT NULL;