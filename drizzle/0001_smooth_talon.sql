CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`content` text NOT NULL,
	`category` enum('DevOps','IoT','Full Stack','Architecture') NOT NULL,
	`tags` text NOT NULL,
	`coverImage` text,
	`published` boolean NOT NULL DEFAULT true,
	`readTime` varchar(32) NOT NULL DEFAULT '5 min read',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`issuer` varchar(255) NOT NULL,
	`credentialId` varchar(255),
	`issueDate` varchar(64) NOT NULL,
	`expiryDate` varchar(64),
	`verificationUrl` text,
	`badgeUrl` text,
	`category` enum('DevOps','IoT','Full Stack','General') NOT NULL DEFAULT 'General',
	`orderIndex` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`category` enum('DevOps','IoT','Full Stack') NOT NULL,
	`imageUrl` text NOT NULL,
	`githubUrl` text,
	`liveUrl` text,
	`technologies` text NOT NULL,
	`problem` text NOT NULL,
	`architecture` text NOT NULL,
	`impact` text NOT NULL,
	`featured` boolean NOT NULL DEFAULT false,
	`orderIndex` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_slug_unique` UNIQUE(`slug`)
);
