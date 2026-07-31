import { notificacionRepository } from "../repositories/notificacion.repository";
import { AppError } from "../middlewares/error.middleware";

export const notificacionService = {
  /**
   * Punto de entrada usado por otros servicios (postulación, chat, admin)
   * para avisarle a un usuario de algo. No expuesto directo por rutas.
   */
  crear(usuarioId: number, tipo: string, mensaje: string) {
    return notificacionRepository.crear(usuarioId, tipo, mensaje);
  },

  listar(usuarioId: number) {
    return notificacionRepository.findByUsuario(usuarioId);
  },

  async marcarLeida(id: number, usuarioId: number) {
    const resultado = await notificacionRepository.marcarLeida(id, usuarioId);
    if (resultado.count === 0) {
      throw new AppError("Notificación no encontrada", 404);
    }
  },

  marcarTodasLeidas(usuarioId: number) {
    return notificacionRepository.marcarTodasLeidas(usuarioId);
  },
};
