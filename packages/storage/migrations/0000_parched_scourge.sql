CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`is_blocked` integer DEFAULT false NOT NULL,
	`blocked_at` integer,
	`created_at` integer NOT NULL,
	CONSTRAINT "accounts_role_check" CHECK("accounts"."role" in ('organizer', 'admin'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_email_unique` ON `accounts` (`email`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT "categories_icon_check" CHECK("categories"."icon" in ('music', 'comedy', 'art', 'theatre', 'cinema', 'food', 'party', 'talk', 'sport', 'market', 'other'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `event_categories` (
	`event_id` text NOT NULL,
	`category_id` text NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`event_id`, `category_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `event_categories_category_idx` ON `event_categories` (`category_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `event_categories_primary_idx` ON `event_categories` (`event_id`) WHERE "event_categories"."is_primary" = 1;--> statement-breakpoint
CREATE TABLE `event_occurrences` (
	`event_id` text NOT NULL,
	`local_date` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	PRIMARY KEY(`event_id`, `local_date`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `event_occurrences_window_idx` ON `event_occurrences` (`ends_at`,`starts_at`);--> statement-breakpoint
CREATE TABLE `event_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`object_key` text NOT NULL,
	`position` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_photos_object_key_unique` ON `event_photos` (`object_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `event_photos_position_idx` ON `event_photos` (`event_id`,`position`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`organizer_id` text NOT NULL,
	`venue_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`starts_at_local` text NOT NULL,
	`ends_at_local` text NOT NULL,
	`recurrence` text,
	`instagram_url` text,
	`facebook_url` text,
	`price` text,
	`is_blocked` integer DEFAULT false NOT NULL,
	`block_reason` text,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`organizer_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `events_organizer_idx` ON `events` (`organizer_id`);--> statement-breakpoint
CREATE INDEX `events_visible_venue_idx` ON `events` (`venue_id`) WHERE "events"."is_blocked" = 0 and "events"."deleted_at" is null;--> statement-breakpoint
CREATE TABLE `venues` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `venues_coordinates_idx` ON `venues` (`latitude`,`longitude`);