CREATE TABLE "social_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"platform" varchar(20) NOT NULL,
	"access_token" text NOT NULL,
	"platform_user_id" text NOT NULL,
	"platform_user_name" text,
	"platform_user_avatar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "social_connections" ADD CONSTRAINT "social_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;