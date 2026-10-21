CREATE TABLE `platform_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`ended_visible_days` integer NOT NULL,
	`participant_threshold` integer NOT NULL,
	`updated_by` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`updated_by`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "platform_settings_single_row" CHECK("platform_settings"."id" = 1)
);
