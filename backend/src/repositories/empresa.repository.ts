import { prisma } from "../config/prisma";
import type { ActualizarPerfilEmpresaDTO } from "../dtos/empresa.dto";

export const empresaRepository = {
  findByUsuarioId(usuarioId: number) {
    return prisma.empresa.findUnique({
      where: { usuarioId },
      include: { usuario: { select: { correo: true } }, _count: { select: { vacantes: true } } },
    });
  },

  actualizarPerfil(empresaId: number, datos: ActualizarPerfilEmpresaDTO) {
    const { razonSocial, giro } = datos;
    return prisma.empresa.update({
      where: { id: empresaId },
      data: {
        ...(razonSocial !== undefined ? { razonSocial } : {}),
        ...(giro !== undefined ? { giro } : {}),
      },
      include: { usuario: { select: { correo: true } }, _count: { select: { vacantes: true } } },
    });
  },
};
