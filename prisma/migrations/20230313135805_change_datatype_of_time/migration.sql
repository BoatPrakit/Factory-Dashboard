/*
  Warnings:

  - You are about to alter the column `duration` on the `downtime` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - You are about to alter the column `cycle_time` on the `station` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE `downtime` MODIFY `duration` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `station` MODIFY `cycle_time` DECIMAL(65, 30) NOT NULL;
