CREATE TABLE `occurrence_saves` (
	`event_id` text NOT NULL,
	`local_date` text NOT NULL,
	`device_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`event_id`, `local_date`, `device_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
