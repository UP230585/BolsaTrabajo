import { empresaRepository } from "../repositories/empresa.repository";
import { AppError } from "../middlewares/error.middleware";
import type { ActualizarPerfilEmpresaDTO } from "../dtos/empresa.dto";

export const empresaService = {
  async obtenerPerfil(usuarioId: number) {
    const empresa = await empresaRepository.findByUsuarioId(usuarioId);
    if (!empresa) {
      throw new AppError("No se encontró un perfil de empresa para esta cuenta", 404);
    }
    return empresa;
  },

  async actualizarPerfil(usuarioId: number, datos: ActualizarPerfilEmpresaDTO) {
    const empresa = await this.obtenerPerfil(usuarioId);
    return empresaRepository.actualizarPerfil(empresa.id, datos);
  },
};
