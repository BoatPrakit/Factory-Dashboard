-- DropForeignKey
ALTER TABLE `extended_cause_availability` DROP FOREIGN KEY `extended_cause_availability_eca_id_fkey`;

-- AddForeignKey
ALTER TABLE `extended_cause_availability` ADD CONSTRAINT `extended_cause_availability_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `line`(`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
