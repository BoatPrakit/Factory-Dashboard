-- DropForeignKey
ALTER TABLE `product_have_failure` DROP FOREIGN KEY `fk_failure_has_product_product1`;

-- AddForeignKey
ALTER TABLE `product_have_failure` ADD CONSTRAINT `fk_failure_has_product_product1` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
