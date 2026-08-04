// Gestión del perfil de empresa (razón social, RFC, giro, etc.).
// Todo aquí opera sobre el usuarioId del token JWT, nunca sobre un id
// de empresa recibido del cliente, para evitar que una empresa edite el
// perfil de otra.
import { empresaRepository } from "../repositories/empresa.repository";
import { AppError } from "../middlewares/error.middleware";
import type { ActualizarPerfilEmpresaDTO } from "../dtos/empresa.dto";

export const empresaService = {
  // Recupera el perfil de empresa asociado a la cuenta autenticada.
  async obtenerPerfil(usuarioId: number) {
    const empresa = await empresaRepository.findByUsuarioId(usuarioId);
    if (!empresa) {
      throw new AppError("No se encontró un perfil de empresa para esta cuenta", 404);
    }
    return empresa;
  },

  // Actualiza los datos del perfil. Reutiliza obtenerPerfil para garantizar
  // que la empresa exista y que la actualización quede ligada al usuarioId
  // del token (ownership), no a un id arbitrario del body.
  async actualizarPerfil(usuarioId: number, datos: ActualizarPerfilEmpresaDTO) {
    const empresa = await this.obtenerPerfil(usuarioId);
    return empresaRepository.actualizarPerfil(empresa.id, datos);
  },
};
