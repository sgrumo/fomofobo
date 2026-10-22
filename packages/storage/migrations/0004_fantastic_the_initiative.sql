ALTER TABLE `venues` ADD `description` text;--> statement-breakpoint
ALTER TABLE `venues` ADD `cover_object_key` text;--> statement-breakpoint
ALTER TABLE `venues` ADD `website_url` text;--> statement-breakpoint
ALTER TABLE `venues` ADD `instagram_url` text;--> statement-breakpoint
ALTER TABLE `venues` ADD `facebook_url` text;--> statement-breakpoint
ALTER TABLE `venues` ADD `owner_id` text REFERENCES accounts(id) ON DELETE set null;--> statement-breakpoint
ALTER TABLE `venues` ADD `is_blocked` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `venues` ADD `block_reason` text;--> statement-breakpoint
CREATE UNIQUE INDEX `venues_cover_object_key_unique` ON `venues` (`cover_object_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `venues_owner_idx` ON `venues` (`owner_id`) WHERE "venues"."owner_id" is not null;