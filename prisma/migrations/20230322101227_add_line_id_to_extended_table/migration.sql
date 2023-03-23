/*
  Warnings:

  - Added the required column `line_id` to the `extended_cause_availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lineId` to the `extended_failure_detail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `extended_cause_availability` ADD COLUMN `line_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `extended_failure_detail` ADD COLUMN `lineId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `extended_cause_availability` ADD CONSTRAINT `extended_cause_availability_eca_id_fkey` FOREIGN KEY (`eca_id`) REFERENCES `line`(`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `extended_failure_detail` ADD CONSTRAINT `extended_failure_detail_lineId_fkey` FOREIGN KEY (`lineId`) REFERENCES `line`(`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
