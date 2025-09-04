-- Drop the existing table and recreate with the new schema
-- This is necessary because we need to change the id from serial to uuid
-- and rename 'name' to 'username', plus add new columns

DROP TABLE IF EXISTS "users";

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"reset_token" text,
	"otp" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);