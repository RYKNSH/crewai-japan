ALTER TABLE `agents` MODIFY COLUMN `tools` json DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `crews` MODIFY COLUMN `agentIds` json DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `crews` MODIFY COLUMN `taskIds` json DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `context` json DEFAULT ('[]');