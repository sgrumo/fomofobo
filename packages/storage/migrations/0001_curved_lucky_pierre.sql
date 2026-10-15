CREATE TABLE "files" (
	"id" uuid PRIMARY KEY NOT NULL,
	"object_key" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "files_object_key_unique" UNIQUE("object_key")
);
