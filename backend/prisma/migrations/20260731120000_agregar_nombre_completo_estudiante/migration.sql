-- Agrega el nombre completo del estudiante. Es nullable porque los
-- estudiantes ya registrados no tienen este dato (solo matrícula); los
-- registros nuevos siempre lo mandan (ver auth.dto.ts).
ALTER TABLE `estudiantes` ADD COLUMN `nombreCompleto` VARCHAR(191) NULL;
