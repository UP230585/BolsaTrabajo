import { prisma } from "../config/prisma";
import type { ActualizarCvDTO, ActualizarPerfilDTO } from "../dtos/estudiante.dto";

export const estudianteRepository = {
  findByUsuarioId(usuarioId: number) {
    return prisma.estudiante.findUnique({
      where: { usuarioId },
      include: { carrera: true, cv: true, insignias: { include: { insignia: true } } },
    });
  },

  actualizarPerfil(estudianteId: number, datos: ActualizarPerfilDTO) {
    return prisma.estudiante.update({
      where: { id: estudianteId },
      data: datos,
    });
  },

  async upsertCv(estudianteId: number, datos: ActualizarCvDTO, porcentaje: number) {
    const cv = await prisma.cV.upsert({
      where: { estudianteId },
      update: { ...datos, porcentaje },
      create: { estudianteId, ...datos, porcentaje },
    });

    await prisma.estudiante.update({
      where: { id: estudianteId },
      data: { porcentajeCV: porcentaje },
    });

    return cv;
  },

  otorgarInsigniaSiNoExiste(estudianteId: number, nombreInsignia: string) {
    return prisma.$transaction(async (tx: typeof prisma) => {
      const insignia = await tx.insignia.findFirst({ where: { nombre: nombreInsignia } });
      if (!insignia) return null;

      const yaExiste = await tx.estudianteInsignia.findUnique({
        where: { estudianteId_insigniaId: { estudianteId, insigniaId: insignia.id } },
      });
      if (yaExiste) return yaExiste;

      return tx.estudianteInsignia.create({
        data: { estudianteId, insigniaId: insignia.id },
      });
    });
  },
};
