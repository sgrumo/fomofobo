CREATE TYPE "public"."todo_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TABLE "todos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"priority" "todo_priority"
);
