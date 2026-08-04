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
      // No hace falta include de usuario aquí: estudiante.usuarioId y
      // empresa.usuarioId ya vienen como campos escalares de cada modelo.
      include: { estudiante: true, empresa: true },
    });
  },

  // Para mostrar con quién se está chateando en el encabezado de la conversación.
  findByIdConDetalle(id: number) {
    return prisma.conversacion.findUnique({
      where: { id },
      include: { estudiante: { include: { usuario: true } }, empresa: true },
    });
  },

  // HU-08: el chat solo permite escribir una vez que la empresa marcó
  // contacto con esa postulación (o avanzó más en el proceso).
  async tieneContactoHabilitado(estudianteId: number, empresaId: number): Promise<boolean> {
    const postulacion = await prisma.postulacion.findFirst({
      where: {
        estudianteId,
        vacante: { empresaId },
        estatus: { in: ["EN_CONTACTO", "ENTREVISTA", "CONTRATADO"] },
      },
      select: { id: true },
    });
    return postulacion !== null;
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
