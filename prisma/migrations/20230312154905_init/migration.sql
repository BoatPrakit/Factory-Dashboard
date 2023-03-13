-- CreateTable
CREATE TABLE `account` (
    `account_id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(50) NOT NULL,
    `password` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`account_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `availability_lose` (
    `al_id` VARCHAR(191) NOT NULL,
    `details` VARCHAR(150) NOT NULL,
    `line_id` INTEGER NOT NULL,

    PRIMARY KEY (`al_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `downtime` (
    `dt_id` INTEGER NOT NULL AUTO_INCREMENT,
    `duration` INTEGER NOT NULL,
    `startAt` DATETIME(0) NOT NULL,
    `endAt` DATETIME(0) NOT NULL,
    `al_id` VARCHAR(191) NOT NULL,
    `s_id` VARCHAR(30) NOT NULL,
    `es_id` INTEGER NOT NULL,

    INDEX `dtd_id_idx`(`al_id`),
    INDEX `es_id_idx`(`es_id`),
    INDEX `s_id_idx`(`s_id`),
    PRIMARY KEY (`dt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee` (
    `em_id` VARCHAR(20) NOT NULL,
    `em_name` VARCHAR(80) NOT NULL,

    PRIMARY KEY (`em_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_shift` (
    `es_id` INTEGER NOT NULL AUTO_INCREMENT,
    `em_id` VARCHAR(20) NOT NULL,
    `ot_id` INTEGER NOT NULL,
    `group` ENUM('A', 'B') NOT NULL,

    INDEX `em_id_idx`(`em_id`),
    INDEX `ot_id_idx`(`ot_id`),
    PRIMARY KEY (`es_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `failure` (
    `f_id` INTEGER NOT NULL AUTO_INCREMENT,
    `s_id` VARCHAR(30) NOT NULL,
    `es_id` INTEGER NOT NULL,
    `fd_id` INTEGER NOT NULL,
    `position` VARCHAR(45) NULL,

    INDEX `es_id_idx`(`es_id`),
    INDEX `fk_failure_failure_detail1_idx`(`fd_id`),
    INDEX `s_id_idx`(`s_id`),
    PRIMARY KEY (`f_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `failure_detail` (
    `fd_id` INTEGER NOT NULL AUTO_INCREMENT,
    `details` VARCHAR(200) NOT NULL,
    `type` ENUM('SCRAP', 'REPAIR', 'REWORK', 'Q-GATE') NOT NULL,
    `abbreviation` VARCHAR(10) NULL,
    `line_id` INTEGER NOT NULL,

    PRIMARY KEY (`fd_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `line` (
    `line_id` INTEGER NOT NULL AUTO_INCREMENT,
    `line_name` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`line_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `model` (
    `model_id` INTEGER NOT NULL AUTO_INCREMENT,
    `model_name` VARCHAR(45) NOT NULL,
    `line_id` INTEGER NOT NULL,

    INDEX `fab_id_idx`(`line_id`),
    PRIMARY KEY (`model_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `working_time` (
    `wt_id` INTEGER NOT NULL AUTO_INCREMENT,
    `shift` ENUM('DAY', 'NIGHT') NOT NULL,
    `type` ENUM('OVERTIME', 'NOT_OVERTIME') NOT NULL,
    `duration` INTEGER NOT NULL,
    `lineId` INTEGER NOT NULL,

    PRIMARY KEY (`wt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `serial_number` VARCHAR(50) NOT NULL,
    `is_goods` BOOLEAN NOT NULL,
    `model_id` INTEGER NOT NULL,
    `timestamp` DATETIME(0) NOT NULL,
    `machine_number` VARCHAR(191) NULL,

    UNIQUE INDEX `product_serial_number_key`(`serial_number`),
    INDEX `fk_product_model1_idx`(`model_id`),
    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_have_failure` (
    `f_id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fk_failure_has_product_failure1_idx`(`f_id`),
    INDEX `fk_failure_has_product_product1_idx`(`product_id`),
    PRIMARY KEY (`f_id`, `product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_plan` (
    `p_id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(0) NOT NULL,
    `target` INTEGER NOT NULL,
    `workingTimeId` INTEGER NOT NULL,
    `group` ENUM('A', 'B') NOT NULL,
    `line_id` INTEGER NOT NULL,

    INDEX `fk_production_plan_line1_idx`(`line_id`),
    PRIMARY KEY (`p_id`, `line_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_input_amount` (
    `pia_id` INTEGER NOT NULL AUTO_INCREMENT,
    `s_id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `amount` INTEGER NOT NULL,
    `position` ENUM('BOTTLE_NECK', 'FIRST_OP') NOT NULL,

    PRIMARY KEY (`pia_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `station` (
    `s_id` VARCHAR(30) NOT NULL,
    `station_name` VARCHAR(45) NOT NULL,
    `line_id` INTEGER NOT NULL,
    `cycle_time` INTEGER NOT NULL,
    `sequence` INTEGER NOT NULL,

    INDEX `line_id_idx`(`line_id`),
    PRIMARY KEY (`s_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `availability_lose` ADD CONSTRAINT `availability_lose_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `line`(`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `downtime` ADD CONSTRAINT `dt_dtd_id` FOREIGN KEY (`al_id`) REFERENCES `availability_lose`(`al_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `downtime` ADD CONSTRAINT `dt_es_id` FOREIGN KEY (`es_id`) REFERENCES `employee_shift`(`es_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `downtime` ADD CONSTRAINT `dt_s_id` FOREIGN KEY (`s_id`) REFERENCES `station`(`s_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `employee_shift` ADD CONSTRAINT `em_id` FOREIGN KEY (`em_id`) REFERENCES `employee`(`em_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `employee_shift` ADD CONSTRAINT `ot_id` FOREIGN KEY (`ot_id`) REFERENCES `working_time`(`wt_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `failure` ADD CONSTRAINT `es_id` FOREIGN KEY (`es_id`) REFERENCES `employee_shift`(`es_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `failure` ADD CONSTRAINT `fk_failure_failure_detail1` FOREIGN KEY (`fd_id`) REFERENCES `failure_detail`(`fd_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `failure` ADD CONSTRAINT `s_id` FOREIGN KEY (`s_id`) REFERENCES `station`(`s_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `failure_detail` ADD CONSTRAINT `failure_detail_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `line`(`line_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `model` ADD CONSTRAINT `line_id` FOREIGN KEY (`line_id`) REFERENCES `line`(`line_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `working_time` ADD CONSTRAINT `working_time_lineId_fkey` FOREIGN KEY (`lineId`) REFERENCES `line`(`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `fk_product_model1` FOREIGN KEY (`model_id`) REFERENCES `model`(`model_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_have_failure` ADD CONSTRAINT `fk_failure_has_product_failure1` FOREIGN KEY (`f_id`) REFERENCES `failure`(`f_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_have_failure` ADD CONSTRAINT `fk_failure_has_product_product1` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `production_plan` ADD CONSTRAINT `fk_production_plan_line1` FOREIGN KEY (`line_id`) REFERENCES `line`(`line_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `production_plan` ADD CONSTRAINT `production_plan_workingTimeId_fkey` FOREIGN KEY (`workingTimeId`) REFERENCES `working_time`(`wt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_input_amount` ADD CONSTRAINT `product_input_amount_s_id_fkey` FOREIGN KEY (`s_id`) REFERENCES `station`(`s_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `station` ADD CONSTRAINT `st_line_id` FOREIGN KEY (`line_id`) REFERENCES `line`(`line_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
