import { prisma } from "../config/prisma";
import type { EmisorMensaje } from "@prisma/client";

export const chatRepository = {
  findOrCreateConversacion(estudianteId: number, empresaId: number) {
    return prisma.conversacion.upsert({
      where: { estudianteId_empresaId: { estudianteId, empresaId } },
      update: {},
      create: { estudianteId, empresaId },
      include: { estudiante: { include: { usuario: true } }, empresa: true },
    });
  },

  findConversacionesDeEstudiante(estudianteId: number) {
    return prisma.conversacion.findMany({
      where: { estudianteId },
      include: {
        empresa: true,
        mensajes: { orderBy: { enviadoEn: "desc" }, take: 1 },
      },
      orderBy: { id: "desc" },
    });
  },

  findConversacionesDeEmpresa(empresaId: number) {
    return prisma.conversacion.findMany({
      where: { empresaId },
      include: {
        estudiante: { include: { usuario: true } },
        mensajes: { orderBy: { enviadoEn: "desc" }, take: 1 },
      },
      orderBy: { id: "desc" },
    });
  },

  findById(id: number) {
    return prisma.conversacion.findUnique({
      where: { id },
      include: { estudiante: true, empresa: true },
    });
  },

  findMensajes(conversacionId: number) {
    return prisma.mensaje.findMany({
      where: { conversacionId },
      orderBy: { enviadoEn: "asc" },
    });
  },

  crearMensaje(conversacionId: number, emisorRol: EmisorMensaje, contenido: string) {
    return prisma.mensaje.create({
      data: { conversacionId, emisorRol, contenido },
    });
  },
};
