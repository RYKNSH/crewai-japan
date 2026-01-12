CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` text NOT NULL,
	`goal` text NOT NULL,
	`backstory` text NOT NULL,
	`tools` json DEFAULT ('[]'),
	`allowDelegation` boolean NOT NULL DEFAULT true,
	`verbose` boolean NOT NULL DEFAULT false,
	`llmConfig` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`process` enum('sequential','hierarchical') NOT NULL DEFAULT 'sequential',
	`verbose` boolean NOT NULL DEFAULT false,
	`agentIds` json DEFAULT ('[]'),
	`taskIds` json DEFAULT ('[]'),
	`managerLlmConfig` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `executions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`crewId` int NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`input` text,
	`output` text,
	`error` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `executions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`executionId` int NOT NULL,
	`tokenUsage` int NOT NULL DEFAULT 0,
	`executionTime` int NOT NULL DEFAULT 0,
	`cost` int NOT NULL DEFAULT 0,
	`successRate` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`expectedOutput` text,
	`agentId` int,
	`context` json DEFAULT ('[]'),
	`asyncExecution` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('builtin','custom','mcp') NOT NULL DEFAULT 'custom',
	`description` text,
	`config` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tools_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `traceLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`executionId` int NOT NULL,
	`agentId` int,
	`taskId` int,
	`eventType` varchar(64) NOT NULL,
	`message` text NOT NULL,
	`metadata` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `traceLogs_id` PRIMARY KEY(`id`)
);
