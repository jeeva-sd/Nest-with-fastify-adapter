-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `fname` VARCHAR(50) NOT NULL,
    `lname` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NULL,
    `bio` VARCHAR(300) NULL,
    `phone` VARCHAR(20) NULL,
    `status` INTEGER NULL,
    `country` VARCHAR(100) NULL,
    `timezone` VARCHAR(50) NOT NULL DEFAULT 'UTC-05:00',
    `profileImage` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uk_user_email`(`email`),
    INDEX `idx_user_fname`(`fname`),
    INDEX `idx_user_name`(`lname`),
    INDEX `idx_user_org`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_departments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `departmentId` INTEGER NOT NULL,
    `title` VARCHAR(255) NULL,

    INDEX `idx_udept_dept`(`departmentId`),
    UNIQUE INDEX `uk_udept_user_dept`(`userId`, `departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_department_supervisors` (
    `id` VARCHAR(191) NOT NULL,
    `userDepartmentId` VARCHAR(191) NOT NULL,
    `supervisorId` VARCHAR(191) NULL,

    INDEX `idx_usup_udept`(`userDepartmentId`),
    INDEX `idx_usup_supervisor`(`supervisorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uk_role_name`(`name`),
    INDEX `idx_role_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `dummyField` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uk_perm_name`(`name`),
    INDEX `idx_perm_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `roleId` VARCHAR(191) NOT NULL,
    `permissionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_rperm_created`(`createdAt`),
    PRIMARY KEY (`roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_user_role` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_departments` ADD CONSTRAINT `fk_udept_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_department_supervisors` ADD CONSTRAINT `fk_usup_udept` FOREIGN KEY (`userDepartmentId`) REFERENCES `user_departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_department_supervisors` ADD CONSTRAINT `fk_usup_user` FOREIGN KEY (`supervisorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `fk_role_perm_role` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `fk_role_perm_perm` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
