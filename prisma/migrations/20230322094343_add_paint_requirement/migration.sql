-- AlterTable
ALTER TABLE `downtime` ADD COLUMN `extended_availability_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `failure` ADD COLUMN `extended_failure_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `failure_detail` MODIFY `type` ENUM('SCRAP', 'REPAIR', 'REWORK', 'RT', 'RP', 'RW', 'PS', 'Q-GATE') NOT NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `is_paint` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paint_at` DATETIME(3) NULL,
    ADD COLUMN `paint_line_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `extended_cause_availability` (
    `eca_id` INTEGER NOT NULL AUTO_INCREMENT,
    `digit` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`eca_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `extended_failure_detail` (
    `extended_failure_id` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`extended_failure_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `downtime` ADD CONSTRAINT `downtime_extended_availability_id_fkey` FOREIGN KEY (`extended_availability_id`) REFERENCES `extended_cause_availability`(`eca_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `failure` ADD CONSTRAINT `failure_extended_failure_id_fkey` FOREIGN KEY (`extended_failure_id`) REFERENCES `extended_failure_detail`(`extended_failure_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_paint_line_id_fkey` FOREIGN KEY (`paint_line_id`) REFERENCES `line`(`line_id`) ON DELETE SET NULL ON UPDATE CASCADE;
