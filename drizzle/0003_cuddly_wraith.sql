CREATE TABLE `eventListeners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`crewId` int NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`callbackFunction` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eventListeners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledgeBase` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentId` int,
	`crewId` int,
	`sourceType` enum('file','url','text') NOT NULL,
	`sourcePath` text,
	`content` text,
	`embedding` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledgeBase_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memoryStore` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`crewId` int,
	`agentId` int,
	`executionId` int,
	`memoryType` enum('short_term','long_term','entity') NOT NULL,
	`content` text NOT NULL,
	`embedding` json,
	`entityType` varchar(64),
	`entityName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `memoryStore_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainingData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`crewId` int NOT NULL,
	`executionId` int NOT NULL,
	`input` text NOT NULL,
	`output` text NOT NULL,
	`feedback` text,
	`rating` int,
	`taskResults` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trainingData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crews` MODIFY COLUMN `process` enum('sequential','hierarchical','consensual') NOT NULL DEFAULT 'sequential';--> statement-breakpoint
ALTER TABLE `executions` MODIFY COLUMN `status` enum('pending','running','completed','failed','awaiting_approval') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `agents` ADD `maxIter` int DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE `agents` ADD `maxRpm` int DEFAULT 10;--> statement-breakpoint
ALTER TABLE `agents` ADD `maxRetryLimit` int DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE `agents` ADD `respectContextWindow` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `agents` ADD `codeExecutionMode` enum('safe','unsafe') DEFAULT 'safe';--> statement-breakpoint
ALTER TABLE `agents` ADD `memory` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `agents` ADD `memoryConfig` json;--> statement-breakpoint
ALTER TABLE `agents` ADD `knowledgeSources` json;--> statement-breakpoint
ALTER TABLE `crews` ADD `memory` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `crews` ADD `memoryConfig` json;--> statement-breakpoint
ALTER TABLE `crews` ADD `planning` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `crews` ADD `planningLlmConfig` json;--> statement-breakpoint
ALTER TABLE `crews` ADD `stepCallback` varchar(255);--> statement-breakpoint
ALTER TABLE `crews` ADD `taskCallback` varchar(255);--> statement-breakpoint
ALTER TABLE `crews` ADD `maxIter` int DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE `executions` ADD `awaitingApprovalTaskId` int;--> statement-breakpoint
ALTER TABLE `executions` ADD `approvalStatus` enum('pending','approved','rejected');--> statement-breakpoint
ALTER TABLE `executions` ADD `plan` json;--> statement-breakpoint
ALTER TABLE `tasks` ADD `outputPydantic` json;--> statement-breakpoint
ALTER TABLE `tasks` ADD `outputFile` varchar(512);--> statement-breakpoint
ALTER TABLE `tasks` ADD `humanInput` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `callbackConfig` json;