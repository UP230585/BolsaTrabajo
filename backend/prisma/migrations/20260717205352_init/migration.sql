-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correo` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `rol` ENUM('ESTUDIANTE', 'EMPRESA', 'COORDINACION') NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuarios_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carreras` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `clave` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `carreras_clave_key`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estudiantes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `matricula` VARCHAR(191) NOT NULL,
    `carreraId` INTEGER NOT NULL,
    `cuatrimestre` INTEGER NOT NULL,
    `fotoUrl` VARCHAR(191) NULL,
    `porcentajeCV` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `estudiantes_usuarioId_key`(`usuarioId`),
    UNIQUE INDEX `estudiantes_matricula_key`(`matricula`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cvs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `estudianteId` INTEGER NOT NULL,
    `archivoUrl` VARCHAR(191) NOT NULL,
    `datosPersonales` BOOLEAN NOT NULL DEFAULT false,
    `formacionAcademica` BOOLEAN NOT NULL DEFAULT false,
    `experienciaLaboral` BOOLEAN NOT NULL DEFAULT false,
    `habilidadesTecnicas` BOOLEAN NOT NULL DEFAULT false,
    `idiomas` BOOLEAN NOT NULL DEFAULT false,
    `fotoPerfil` BOOLEAN NOT NULL DEFAULT false,
    `porcentaje` INTEGER NOT NULL DEFAULT 0,
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cvs_estudianteId_key`(`estudianteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `razonSocial` VARCHAR(191) NOT NULL,
    `rfc` VARCHAR(191) NOT NULL,
    `giro` VARCHAR(191) NOT NULL,
    `aprobada` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `empresas_usuarioId_key`(`usuarioId`),
    UNIQUE INDEX `empresas_rfc_key`(`rfc`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vacantes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `empresaId` INTEGER NOT NULL,
    `carreraId` INTEGER NOT NULL,
    `cuatrimestreMin` INTEGER NOT NULL,
    `modalidad` ENUM('PRESENCIAL', 'HIBRIDO', 'REMOTO') NOT NULL DEFAULT 'PRESENCIAL',
    `salario` DECIMAL(10, 2) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `aprobada` BOOLEAN NOT NULL DEFAULT false,
    `creadaEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postulaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `estudianteId` INTEGER NOT NULL,
    `vacanteId` INTEGER NOT NULL,
    `estatus` ENUM('POSTULADO', 'VISTO', 'EN_CONTACTO', 'ENTREVISTA', 'CONTRATADO', 'NO_SELECCIONADO') NOT NULL DEFAULT 'POSTULADO',
    `creadaEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadaEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `postulaciones_estudianteId_vacanteId_key`(`estudianteId`, `vacanteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `estudianteId` INTEGER NOT NULL,
    `empresaId` INTEGER NOT NULL,
    `creadaEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `conversaciones_estudianteId_empresaId_key`(`estudianteId`, `empresaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mensajes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversacionId` INTEGER NOT NULL,
    `emisorRol` ENUM('ESTUDIANTE', 'EMPRESA') NOT NULL,
    `contenido` TEXT NOT NULL,
    `enviadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insignias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `icono` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estudiante_insignias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `estudianteId` INTEGER NOT NULL,
    `insigniaId` INTEGER NOT NULL,
    `obtenidaEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `estudiante_insignias_estudianteId_insigniaId_key`(`estudianteId`, `insigniaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `mensaje` VARCHAR(191) NOT NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `creadaEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `estudiantes` ADD CONSTRAINT `estudiantes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estudiantes` ADD CONSTRAINT `estudiantes_carreraId_fkey` FOREIGN KEY (`carreraId`) REFERENCES `carreras`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cvs` ADD CONSTRAINT `cvs_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `estudiantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empresas` ADD CONSTRAINT `empresas_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacantes` ADD CONSTRAINT `vacantes_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vacantes` ADD CONSTRAINT `vacantes_carreraId_fkey` FOREIGN KEY (`carreraId`) REFERENCES `carreras`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postulaciones` ADD CONSTRAINT `postulaciones_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `estudiantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postulaciones` ADD CONSTRAINT `postulaciones_vacanteId_fkey` FOREIGN KEY (`vacanteId`) REFERENCES `vacantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversaciones` ADD CONSTRAINT `conversaciones_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `estudiantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversaciones` ADD CONSTRAINT `conversaciones_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mensajes` ADD CONSTRAINT `mensajes_conversacionId_fkey` FOREIGN KEY (`conversacionId`) REFERENCES `conversaciones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estudiante_insignias` ADD CONSTRAINT `estudiante_insignias_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `estudiantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estudiante_insignias` ADD CONSTRAINT `estudiante_insignias_insigniaId_fkey` FOREIGN KEY (`insigniaId`) REFERENCES `insignias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificaciones` ADD CONSTRAINT `notificaciones_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
