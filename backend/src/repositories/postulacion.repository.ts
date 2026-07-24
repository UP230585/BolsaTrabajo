import { prisma } from "../config/prisma";
import type { EstatusPostulacion } from "@prisma/client";

export const postulacionRepository = {
  findByEstudianteAndVacante(estudianteId: number, vacanteId: number) {
    return prisma.postulacion.findUnique({
      where: { estudianteId_vacanteId: { estudianteId, vacanteId } },
    });
  },

  create(estudianteId: number, vacanteId: number) {
    return prisma.postulacion.create({
      data: { estudianteId, vacanteId },
    });
  },

  findByEstudiante(estudianteId: number) {
    return prisma.postulacion.findMany({
      where: { estudianteId },
      include: { vacante: { include: { empresa: true, carrera: true } } },
      orderBy: { creadaEn: "desc" },
    });
  },

  // Para el dashboard de la empresa: todas las postulaciones de sus vacantes.
  findByEmpresa(empresaId: number) {
    return prisma.postulacion.findMany({
      where: { vacante: { empresaId } },
      include: { vacante: true, estudiante: { include: { usuario: true, carrera: true } } },
      orderBy: { creadaEn: "desc" },
    });
  },

  findById(id: number) {
    return prisma.postulacion.findUnique({
      where: { id },
      include: { vacante: true },
    });
  },

  actualizarEstatus(id: number, estatus: EstatusPostulacion) {
    return prisma.postulacion.update({
      where: { id },
      data: { estatus },
    });
  },
};
