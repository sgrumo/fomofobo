CREATE TABLE `auth_jwks` (
	`id` text PRIMARY KEY NOT NULL,
	`public_key` text NOT NULL,
	`private_key` text NOT NULL,
	`alg` text,
	`crv` text,
	`created_at` integer NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE TABLE `auth_oauth_access_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text,
	`client_id` text NOT NULL,
	`session_id` text,
	`account_id` text,
	`refresh_id` text,
	`reference_id` text,
	`authorization_code_id` text,
	`resources` text,
	`requested_user_info_claims` text,
	`scopes` text NOT NULL,
	`confirmation` text,
	`revoked` integer,
	`expires_at` integer,
	`created_at` integer,
	FOREIGN KEY (`client_id`) REFERENCES `auth_oauth_clients`(`client_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `auth_sessions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`refresh_id`) REFERENCES `auth_oauth_refresh_tokens`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_oauth_access_tokens_token_unique` ON `auth_oauth_access_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `auth_oauth_access_tokens_client_id_idx` ON `auth_oauth_access_tokens` (`client_id`);--> statement-breakpoint
CREATE INDEX `auth_oauth_access_tokens_session_id_idx` ON `auth_oauth_access_tokens` (`session_id`);--> statement-breakpoint
CREATE INDEX `auth_oauth_access_tokens_account_id_idx` ON `auth_oauth_access_tokens` (`account_id`);--> statement-breakpoint
CREATE INDEX `auth_oauth_access_tokens_refresh_id_idx` ON `auth_oauth_access_tokens` (`refresh_id`);--> statement-breakpoint
CREATE INDEX `auth_oauth_access_tokens_authorization_code_id_idx` ON `auth_oauth_access_tokens` (`authorization_code_id`);--> statement-breakpoint
CREATE TABLE `auth_oauth_client_assertions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `auth_oauth_client_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`resource_id` text NOT NULL,
	`metadata` text,
	`created_at` integer,
	FOREIGN KEY (`client_id`) REFERENCES `auth_oauth_clients`(`client_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`resource_id`) REFERENCES `auth_oauth_resources`(`identifier`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `auth_oauth_client_resources_client_id_idx` ON `auth_oauth_client_resources` (`client_id`);--> statement-breakpoint
CREATE INDEX `auth_oauth_client_resources_resource_id_idx` ON `auth_oauth_client_resources` (`resource_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `auth_oauth_client_resources_client_resource_idx` ON `auth_oauth_client_resources` (`client_id`,`resource_id`);--> statement-breakpoint
CREATE TABLE `auth_oauth_clients` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`client_secret` text,
	`client_discovery_id` text,
	`disabled` integer DEFAULT false,
	`skip_consent` integer,
	`enable_end_session` integer,
	`subject_type` text,
	`scopes` text,
	`client_credentials_scopes` text,
	`account_id` text,
	`name` text,
	`uri` text,
	`icon` text,
	`contacts` text,
	`tos` text,
	`policy` text,
	`software_id` text,
	`software_version` text,
	`software_statement` text,
	`redirect_uris` text NOT NULL,
	`post_logout_redirect_uris` text,
	`backchannel_logout_uri` text,
	`backchannel_logout_session_required` integer,
	`token_endpoint_auth_method` text,
	`application_type` text,
	`jwks` text,
	`jwks_uri` text,
	`grant_types` text,
	`response_types` text,
	`require_pkce` integer,
	`dpop_bound_access_tokens` integer DEFAULT false,
	`reference_id` text,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_oauth_clients_client_id_unique` ON `auth_oauth_clients` (`client_id`);--> statement-breakpoint
CREATE INDEX `auth_oauth_clients_account_id_idx` ON `auth_oauth_clients` (`account_id`);--> statement-breakpoint
CREATE TABLE `auth_oauth_consents` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`account_id` text,
	`reference_id` text,
	`resources` text,
	`requested_user_info_claims` text,
	`scopes` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`client_id`) REFERENCES `auth_oauth_clients`(`client_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `auth_oauth_consents_client_id_idx` ON `auth_oauth_consents` (`client_id`);--> statement-breakpoint
CREATE INDEX `auth_oauth_consents_account_id_idx` ON `auth_oauth_consents` (`account_id`);--> statement-breakpoint
CREATE TABLE `auth_oauth_refresh_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`client_id` text NOT NULL,
	`session_id` text,
	`account_id` text NOT NULL,
	`reference_id` text,
	`authorization_code_id` text,
	`resources` text,
	`requested_user_info_claims` text,
	`scopes` text NOT NULL,
	`confirmation` text,
	`rotation_replay_response` text,
	`rotation_replay_expires_at` integer,
	`auth_time` integer,
	`rotated_at` integer,
	`revoked` integer,
	`expires_at` integer,
	`created_at` integer,
	FOREIGN KEY (`client_id`) REFERENCES `auth_oauth_clients`(`client_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `auth_sessions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_oauth_refresh_tokens_token_unique` ON `auth_oauth_refresh_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `auth_oauth_refresh_tokens_client_id_idx` ON `auth_oauth_refresh_tokens` (`client_id`);--> statement-breakpoint
CREATE INDEX `auth_oauth_refresh_tokens_session_id_idx` ON `auth_oauth_refresh_tokens` (`session_id`);--> statement-breakpoint
CREATE INDEX `auth_oauth_refresh_tokens_account_id_idx` ON `auth_oauth_refresh_tokens` (`account_id`);--> statement-breakpoint
CREATE INDEX `auth_oauth_refresh_tokens_authorization_code_id_idx` ON `auth_oauth_refresh_tokens` (`authorization_code_id`);--> statement-breakpoint
CREATE TABLE `auth_oauth_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`name` text NOT NULL,
	`access_token_ttl` integer,
	`refresh_token_ttl` integer,
	`signing_algorithm` text,
	`signing_key_id` text,
	`allowed_scopes` text,
	`custom_claims` text,
	`dpop_bound_access_tokens_required` integer DEFAULT false,
	`disabled` integer DEFAULT false,
	`policy_version` integer DEFAULT 1,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_oauth_resources_identifier_unique` ON `auth_oauth_resources` (`identifier`);