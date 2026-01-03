PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_collections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_collections`("id", "name", "description", "created_at", "updated_at") SELECT "id", "name", "description", "created_at", "updated_at" FROM `collections`;--> statement-breakpoint
DROP TABLE `collections`;--> statement-breakpoint
ALTER TABLE `__new_collections` RENAME TO `collections`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_images` (
	`id` text PRIMARY KEY NOT NULL,
	`snippet_id` text,
	`imagekit_file_id` text NOT NULL,
	`imagekit_url` text NOT NULL,
	`file_size` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`snippet_id`) REFERENCES `snippets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_images`("id", "snippet_id", "imagekit_file_id", "imagekit_url", "file_size", "created_at") SELECT "id", "snippet_id", "imagekit_file_id", "imagekit_url", "file_size", "created_at" FROM `images`;--> statement-breakpoint
DROP TABLE `images`;--> statement-breakpoint
ALTER TABLE `__new_images` RENAME TO `images`;--> statement-breakpoint
CREATE INDEX `images_snippet_id_idx` ON `images` (`snippet_id`);--> statement-breakpoint
CREATE TABLE `__new_snippets` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_snippets`("id", "type", "content", "metadata", "created_at", "updated_at") SELECT "id", "type", "content", "metadata", "created_at", "updated_at" FROM `snippets`;--> statement-breakpoint
DROP TABLE `snippets`;--> statement-breakpoint
ALTER TABLE `__new_snippets` RENAME TO `snippets`;--> statement-breakpoint
CREATE INDEX `snippets_type_idx` ON `snippets` (`type`);--> statement-breakpoint
CREATE INDEX `snippets_created_at_idx` ON `snippets` (`created_at`);--> statement-breakpoint
CREATE TABLE `__new_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tags`("id", "name", "created_at") SELECT "id", "name", "created_at" FROM `tags`;--> statement-breakpoint
DROP TABLE `tags`;--> statement-breakpoint
ALTER TABLE `__new_tags` RENAME TO `tags`;--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE INDEX `tags_name_idx` ON `tags` (`name`);--> statement-breakpoint
ALTER TABLE `users` ADD `database_id` text;