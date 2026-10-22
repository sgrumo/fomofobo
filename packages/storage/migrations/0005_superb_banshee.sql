ALTER TABLE `venues` ADD `kind` text DEFAULT 'regular' NOT NULL;--> statement-breakpoint
ALTER TABLE `venues` ADD `programme_url` text;--> statement-breakpoint
ALTER TABLE `venues` ADD `category_id` text REFERENCES categories(id) ON DELETE restrict;