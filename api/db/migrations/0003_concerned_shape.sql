ALTER TABLE `verification_tokens` RENAME TO `email_verification_tokens`;--> statement-breakpoint
ALTER TABLE `email_verification_tokens` RENAME COLUMN "token" TO "token_hash";--> statement-breakpoint
ALTER TABLE `email_verification_tokens` RENAME COLUMN "identifier" TO "user_id";--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `password_reset_user_id_idx` ON `password_reset_tokens` (`user_id`);--> statement-breakpoint
DROP INDEX `verification_tokens_token_unique`;--> statement-breakpoint
DROP INDEX `verification_tokens_identifier_idx`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_email_verification_tokens` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_email_verification_tokens`("token_hash", "user_id", "expires_at") SELECT "token_hash", "user_id", "expires_at" FROM `email_verification_tokens`;--> statement-breakpoint
DROP TABLE `email_verification_tokens`;--> statement-breakpoint
ALTER TABLE `__new_email_verification_tokens` RENAME TO `email_verification_tokens`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `email_verification_user_id_idx` ON `email_verification_tokens` (`user_id`);--> statement-breakpoint
DROP INDEX `sessions_token_unique`;--> statement-breakpoint
ALTER TABLE `sessions` DROP COLUMN `token`;--> statement-breakpoint
ALTER TABLE `sessions` DROP COLUMN `ip_address`;--> statement-breakpoint
ALTER TABLE `sessions` DROP COLUMN `user_agent`;--> statement-breakpoint
ALTER TABLE `sessions` DROP COLUMN `created_at`;--> statement-breakpoint
ALTER TABLE `sessions` DROP COLUMN `updated_at`;