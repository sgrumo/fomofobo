ALTER TABLE `events` ADD `is_free` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `full_price_cents` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `reduced_prices` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `membership_name` text;--> statement-breakpoint
ALTER TABLE `events` ADD `membership_cost_cents` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `minimum_age` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `price_notes` text;--> statement-breakpoint
ALTER TABLE `events` ADD `capacity` integer;