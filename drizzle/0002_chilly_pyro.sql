ALTER TABLE `agents` MODIFY COLUMN `tools` json;--> statement-breakpoint
ALTER TABLE `crews` MODIFY COLUMN `agentIds` json;--> statement-breakpoint
ALTER TABLE `crews` MODIFY COLUMN `taskIds` json;--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `context` json;