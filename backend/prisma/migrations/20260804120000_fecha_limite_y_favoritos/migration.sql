-- Agrega la fecha límite de postulación a la vacante (vigencia) y la tabla
-- de vacantes guardadas (favoritos del estudiante).
ALTER TABLE `vacantes` ADD COLUMN `fechaLimite` DATE NULL;

-- CreateTable
CREATE TABLE `vacantes_guardadas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `estudianteId` INTEGER NOT NULL,
    `vacanteId` INTEGER NOT NULL,
    `creadaEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `vacantes_guardadas_estudianteId_vacanteId_key`(`estudianteId`, `vacanteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `vacantes_guardadas` ADD CONSTRAINT `vacantes_guardadas_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `estudiantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacantes_guardadas` ADD CONSTRAINT `vacantes_guardadas_vacanteId_fkey` FOREIGN KEY (`vacanteId`) REFERENCES `vacantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
