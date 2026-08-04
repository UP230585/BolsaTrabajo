import { prisma } from "../config/prisma";

export const notificacionRepository = {
  crear(usuarioId: number, tipo: string, mensaje: string) {
    return prisma.notificacion.create({
      data: { usuarioId, tipo, mensaje },
    });
  },

  findByUsuario(usuarioId: number) {
    return prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { creadaEn: "desc" },
      take: 50,
    });
  },

  marcarLeida(id: number, usuarioId: number) {
    // El "where" incluye usuarioId a propósito: así una persona no puede
    // marcar como leída una notificación que no es suya solo adivinando el id.
    return prisma.notificacion.updateMany({
      where: { id, usuarioId },
      data: { leida: true },
    });
  },

  marcarTodasLeidas(usuarioId: number) {
    return prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true },
    });
  },
};
