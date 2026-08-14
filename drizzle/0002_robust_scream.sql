CREATE TABLE `profile_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL DEFAULT 'Alex Chen',
	`title` varchar(255) NOT NULL DEFAULT 'DevOps, IoT & Full Stack Principal Engineer',
	`bio` text NOT NULL,
	`avatarUrl` text NOT NULL,
	`githubUrl` varchar(255),
	`linkedinUrl` varchar(255),
	`twitterUrl` varchar(255),
	`email` varchar(320),
	`activeTheme` enum('devops','iot','fullstack') NOT NULL DEFAULT 'devops',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profile_settings_id` PRIMARY KEY(`id`)
);
