/*
  Warnings:

  - Made the column `roleId` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `fk_user_role`;

-- DropIndex
DROP INDEX `fk_user_role` ON `users`;

-- AlterTable
ALTER TABLE `roles` ADD COLUMN `permissionRevision` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `users` MODIFY `roleId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_user_role` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `idx_user_name` TO `idx_user_lname`;
