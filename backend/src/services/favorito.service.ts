// Vacantes guardadas por el estudiante (favoritos), para armar una lista
// corta sin tener que postularse todavía.
import { favoritoRepository } from "../repositories/favorito.repository";
import { AppError } from "../middlewares/error.middleware";

export const favoritoService = {
  async guardar(estudianteId: number, vacanteId: number) {
    const existente = await favoritoRepository.findByEstudianteAndVacante(estudianteId, vacanteId);
    if (existente) {
      throw new AppError("Ya guardaste esta vacante", 409);
    }
    return favoritoRepository.create(estudianteId, vacanteId);
  },

  quitar(estudianteId: number, vacanteId: number) {
    return favoritoRepository.eliminar(estudianteId, vacanteId);
  },

  misGuardadas(estudianteId: number) {
    return favoritoRepository.findByEstudiante(estudianteId);
  },
};
