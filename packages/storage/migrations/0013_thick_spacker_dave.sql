ALTER TABLE `categories` ADD `image_original_object_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `categories_image_original_object_key_unique` ON `categories` (`image_original_object_key`);--> statement-breakpoint
ALTER TABLE `event_photos` ADD `original_object_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `event_photos_original_object_key_unique` ON `event_photos` (`original_object_key`);--> statement-breakpoint
ALTER TABLE `venues` ADD `cover_original_object_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `venues_cover_original_object_key_unique` ON `venues` (`cover_original_object_key`);