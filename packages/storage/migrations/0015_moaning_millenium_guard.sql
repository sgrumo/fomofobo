CREATE TABLE `active_device_days` (
	`device_id` text NOT NULL,
	`local_date` text NOT NULL,
	`platform` text NOT NULL,
	`app_version` text,
	PRIMARY KEY(`device_id`, `local_date`),
	CONSTRAINT "active_device_days_platform_check" CHECK("active_device_days"."platform" in ('ios', 'android', 'web'))
);
--> statement-breakpoint
CREATE INDEX `active_device_days_date_idx` ON `active_device_days` (`local_date`);