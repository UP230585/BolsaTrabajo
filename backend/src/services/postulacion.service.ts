// Ciclo de vida de una postulación: HU-04 (postularse con un clic),
// HU-07 (panel Kanban) y el lado de empresa que mueve el estatus.
import { postulacionRepository } from "../repositories/postulacion.repository";
import { notificacionService } from "./notificacion.service";
import { AppError } from "../middlewares/error.middleware";
import type { EstatusPostulacion } from "@prisma/client";

// Etiquetas legibles para el estudiante; deben coincidir 1 a 1 con las
// columnas del panel Kanban del frontend (Postulado, Visto, En contacto,
// Entrevista, Contratado, No seleccionado).
const ETIQUETA_ESTATUS: Record<EstatusPostulacion, string> = {
  POSTULADO: "Postulado",
  VISTO: "Visto",
  EN_CONTACTO: "En contacto",
  ENTREVISTA: "Entrevista",
  CONTRATADO: "Contratado",
  NO_SELECCIONADO: "No seleccionado",
};

export const postulacionService = {
  // Postulación con un clic (HU-04). Se bloquea la doble postulación a la
  // misma vacante mediante el índice único (estudianteId, vacanteId) en
  // Prisma; aquí se valida antes para devolver un mensaje claro en vez de
  // un error crudo de base de datos.
  async postularse(estudianteId: number, vacanteId: number) {
    const existente = await postulacionRepository.findByEstudianteAndVacante(estudianteId, vacanteId);
    if (existente) {
      throw new AppError("Ya te postulaste a esta vacante", 409);
    }
    return postulacionRepository.create(estudianteId, vacanteId);
  },

  // Todas las postulaciones del estudiante autenticado, para alimentar
  // el panel Kanban (HU-07).
  misPostulaciones(estudianteId: number) {
    return postulacionRepository.findByEstudiante(estudianteId);
  },

  // Postulaciones recibidas por las vacantes de la empresa autenticada.
  postulacionesDeMiEmpresa(empresaId: number) {
    return postulacionRepository.findByEmpresa(empresaId);
  },

  // La empresa mueve una postulación a otro estatus del Kanban. Verifica
  // ownership (la vacante debe pertenecer a la empresa que hace la
  // petición) antes de escribir, y notifica al estudiante del cambio.
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
