import { prisma } from "../config/prisma";

export const favoritoRepository = {
  findByEstudianteAndVacante(estudianteId: number, vacanteId: number) {
    return prisma.vacanteGuardada.findUnique({
      where: { estudianteId_vacanteId: { estudianteId, vacanteId } },
    });
  },

  create(estudianteId: number, vacanteId: number) {
    return prisma.vacanteGuardada.create({ data: { estudianteId, vacanteId } });
  },

  eliminar(estudianteId: number, vacanteId: number) {
    return prisma.vacanteGuardada.deleteMany({ where: { estudianteId, vacanteId } });
  },

  findByEstudiante(estudianteId: number) {
    return prisma.vacanteGuardada.findMany({
      where: { estudianteId },
      include: { vacante: { include: { empresa: true, carrera: true } } },
      orderBy: { creadaEn: "desc" },
    });
  },
};
