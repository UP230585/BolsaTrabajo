import { postulacionRepository } from "../repositories/postulacion.repository";
import { AppError } from "../middlewares/error.middleware";
import type { EstatusPostulacion } from "@prisma/client";

export const postulacionService = {
  async postularse(estudianteId: number, vacanteId: number) {
    const existente = await postulacionRepository.findByEstudianteAndVacante(estudianteId, vacanteId);
    if (existente) {
      throw new AppError("Ya te postulaste a esta vacante", 409);
    }
    return postulacionRepository.create(estudianteId, vacanteId);
  },

  misPostulaciones(estudianteId: number) {
    return postulacionRepository.findByEstudiante(estudianteId);
  },

  postulacionesDeMiEmpresa(empresaId: number) {
    return postulacionRepository.findByEmpresa(empresaId);
  },

  async actualizarEstatus(id: number, empresaId: number, estatus: EstatusPostulacion) {
    const postulacion = await postulacionRepository.findById(id);
    if (!postulacion) {
      throw new AppError("Postulación no encontrada", 404);
    }
    if (postulacion.vacante.empresaId !== empresaId) {
      throw new AppError("No puedes modificar postulaciones de otra empresa", 403);
    }
    return postulacionRepository.actualizarEstatus(id, estatus);
  },
};
