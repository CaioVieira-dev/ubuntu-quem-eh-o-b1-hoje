CREATE TABLE IF NOT EXISTS "quem-eh-o-b1-hoje_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "quem-eh-o-b1-hoje_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quem-eh-o-b1-hoje_click_up_config" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"click_up_user_token" varchar(255),
	"click_up_user_token_updated_at" timestamp with time zone,
	"ticket_list_id" bigint,
	"b1_field_uuid" varchar(255),
	"b2_field_uuid" varchar(255),
	"open_label" varchar(255),
	"closed_label" varchar(255),
	CONSTRAINT "quem-eh-o-b1-hoje_click_up_config_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quem-eh-o-b1-hoje_click_up_user" (
	"id" integer PRIMARY KEY NOT NULL,
	"username" varchar(255),
	"email" varchar(255) NOT NULL,
	"profile_picture" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quem-eh-o-b1-hoje_invites" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"used" boolean,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quem-eh-o-b1-hoje_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quem-eh-o-b1-hoje_ticket" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "quem-eh-o-b1-hoje_ticket_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"card" varchar(256) NOT NULL,
	"card_name" text NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"b1_id" integer,
	"b1_updated_at" timestamp with time zone,
	"b2_id" integer,
	"b2_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"company" varchar(256) NOT NULL,
	"is_closed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quem-eh-o-b1-hoje_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"clickup_user_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quem-eh-o-b1-hoje_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "quem-eh-o-b1-hoje_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quem-eh-o-b1-hoje_account" ADD CONSTRAINT "quem-eh-o-b1-hoje_account_user_id_quem-eh-o-b1-hoje_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."quem-eh-o-b1-hoje_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quem-eh-o-b1-hoje_session" ADD CONSTRAINT "quem-eh-o-b1-hoje_session_user_id_quem-eh-o-b1-hoje_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."quem-eh-o-b1-hoje_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quem-eh-o-b1-hoje_ticket" ADD CONSTRAINT "quem-eh-o-b1-hoje_ticket_created_by_quem-eh-o-b1-hoje_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."quem-eh-o-b1-hoje_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quem-eh-o-b1-hoje_ticket" ADD CONSTRAINT "quem-eh-o-b1-hoje_ticket_b1_id_quem-eh-o-b1-hoje_click_up_user_id_fk" FOREIGN KEY ("b1_id") REFERENCES "public"."quem-eh-o-b1-hoje_click_up_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quem-eh-o-b1-hoje_ticket" ADD CONSTRAINT "quem-eh-o-b1-hoje_ticket_b2_id_quem-eh-o-b1-hoje_click_up_user_id_fk" FOREIGN KEY ("b2_id") REFERENCES "public"."quem-eh-o-b1-hoje_click_up_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "quem-eh-o-b1-hoje_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "quem-eh-o-b1-hoje_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ticket_created_by_idx" ON "quem-eh-o-b1-hoje_ticket" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ticket_card_idx" ON "quem-eh-o-b1-hoje_ticket" USING btree ("card");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ticket_b1_and_b1_updated_at_idx" ON "quem-eh-o-b1-hoje_ticket" USING btree ("b1_id","b1_updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ticket_b2_and_b2_updated_at_idx" ON "quem-eh-o-b1-hoje_ticket" USING btree ("b2_id","b2_updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ticket_company_idx" ON "quem-eh-o-b1-hoje_ticket" USING btree ("company");