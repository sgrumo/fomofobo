ALTER TABLE `categories` ADD `image_object_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `categories_image_object_key_unique` ON `categories` (`image_object_key`);