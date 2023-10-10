-- DropForeignKey
ALTER TABLE `logs_protocol` DROP FOREIGN KEY `logs_protocol_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `logs_request` DROP FOREIGN KEY `logs_request_user_id_fkey`;

-- AlterTable
ALTER TABLE `logs_protocol` MODIFY `user_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `logs_request` MODIFY `user_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `logs_request` ADD CONSTRAINT `logs_request_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs_protocol` ADD CONSTRAINT `logs_protocol_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
