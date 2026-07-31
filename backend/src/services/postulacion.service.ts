import { postulacionRepository } from "../repositories/postulacion.repository";
import { notificacionService } from "./notificacion.service";
import { AppError } from "../middlewares/error.middleware";
import type { EstatusPostulacion } from "@prisma/client";

const ETIQUETA_ESTATUS: Record<EstatusPostulacion, string> = {
  POSTULADO: "Postulado",
  VISTO: "Visto",
  EN_CONTACTO: "En contacto",
  ENTREVISTA: "Entrevista",
  CONTRATADO: "Contratado",
  NO_SELECCIONADO: "No seleccionado",
};

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
    const actualizada = await postulacionRepository.actualizarEstatus(id, estatus);

    await notificacionService.crear(
      postulacion.estudiante.usuarioId,
      "postulacion",
      `Tu postulación a "${postulacion.vacante.titulo}" cambió a: ${ETIQUETA_ESTATUS[estatus]}`
    );

    return actualizada;
  },
};
