CREATE TABLE `recurring_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`billing_interval_type` text NOT NULL,
	`billing_frequency` integer NOT NULL,
	`billing_day` integer NOT NULL,
	`billing_month` integer,
	`status` text NOT NULL,
	`memo` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
