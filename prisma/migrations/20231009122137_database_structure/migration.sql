-- DropIndex
DROP INDEX `logs_protocol_protocol_id_fkey` ON `logs_protocol`;

-- DropIndex
DROP INDEX `logs_protocol_status_id_fkey` ON `logs_protocol`;

-- DropIndex
DROP INDEX `logs_protocol_user_id_fkey` ON `logs_protocol`;

-- DropIndex
DROP INDEX `logs_request_request_id_fkey` ON `logs_request`;

-- DropIndex
DROP INDEX `logs_request_status_id_fkey` ON `logs_request`;

-- DropIndex
DROP INDEX `logs_request_user_id_fkey` ON `logs_request`;

-- DropIndex
DROP INDEX `product_image_product_id_fkey` ON `product_image`;

-- DropIndex
DROP INDEX `products_protocol_id_fkey` ON `products`;

-- DropIndex
DROP INDEX `products_reason_id_fkey` ON `products`;

-- DropIndex
DROP INDEX `protocols_request_id_fkey` ON `protocols`;

-- DropIndex
DROP INDEX `protocols_status_id_fkey` ON `protocols`;

-- DropIndex
DROP INDEX `requests_status_id_fkey` ON `requests`;

-- AddForeignKey
ALTER TABLE `requests` ADD CONSTRAINT `requests_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `status`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `protocols` ADD CONSTRAINT `protocols_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `protocols` ADD CONSTRAINT `protocols_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_reason_id_fkey` FOREIGN KEY (`reason_id`) REFERENCES `reasons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_protocol_id_fkey` FOREIGN KEY (`protocol_id`) REFERENCES `protocols`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_image` ADD CONSTRAINT `product_image_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs_request` ADD CONSTRAINT `logs_request_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs_request` ADD CONSTRAINT `logs_request_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs_request` ADD CONSTRAINT `logs_request_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs_protocol` ADD CONSTRAINT `logs_protocol_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs_protocol` ADD CONSTRAINT `logs_protocol_protocol_id_fkey` FOREIGN KEY (`protocol_id`) REFERENCES `protocols`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs_protocol` ADD CONSTRAINT `logs_protocol_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
