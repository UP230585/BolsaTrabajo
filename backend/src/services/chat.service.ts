import { chatRepository } from "../repositories/chat.repository";
import { vacanteRepository } from "../repositories/vacante.repository";
import { postulacionRepository } from "../repositories/postulacion.repository";
import { AppError } from "../middlewares/error.middleware";
import type { EmisorMensaje } from "@prisma/client";

export const chatService = {
  async iniciarDesdeVacante(estudianteId: number, vacanteId: number) {
    const vacante = await vacanteRepository.findById(vacanteId);
    if (!vacante) {
      throw new AppError("Vacante no encontrada", 404);
    }

    // HU-08: el chat solo se habilita después de que el estudiante se postuló.
    const postulacion = await postulacionRepository.findByEstudianteAndVacante(estudianteId, vacanteId);
    if (!postulacion) {
      throw new AppError("Debes postularte a la vacante antes de poder chatear con la empresa", 403);
    }

    return chatRepository.findOrCreateConversacion(estudianteId, vacante.empresaId);
  },

  misConversacionesEstudiante(estudianteId: number) {
    return chatRepository.findConversacionesDeEstudiante(estudianteId);
  },

  misConversacionesEmpresa(empresaId: number) {
    return chatRepository.findConversacionesDeEmpresa(empresaId);
  },

  async obtenerMensajes(conversacionId: number, participante: { estudianteId?: number; empresaId?: number }) {
    const conversacion = await chatRepository.findById(conversacionId);
    if (!conversacion) {
      throw new AppError("Conversación no encontrada", 404);
    }
    this.validarParticipante(conversacion, participante);
    return chatRepository.findMensajes(conversacionId);
  },

  async enviarMensaje(
    conversacionId: number,
    participante: { estudianteId?: number; empresaId?: number },
    emisorRol: EmisorMensaje,
    contenido: string
  ) {
    const conversacion = await chatRepository.findById(conversacionId);
    if (!conversacion) {
      throw new AppError("Conversación no encontrada", 404);
    }
    this.validarParticipante(conversacion, participante);
    return chatRepository.crearMensaje(conversacionId, emisorRol, contenido);
  },

  validarParticipante(
    conversacion: { estudianteId: number; empresaId: number },
    participante: { estudianteId?: number; empresaId?: number }
  ) {
    const esEstudianteDeLaConversacion =
      participante.estudianteId !== undefined && participante.estudianteId === conversacion.estudianteId;
    const esEmpresaDeLaConversacion =
      participante.empresaId !== undefined && participante.empresaId === conversacion.empresaId;

    if (!esEstudianteDeLaConversacion && !esEmpresaDeLaConversacion) {
      throw new AppError("No tienes acceso a esta conversación", 403);
    }
  },
};
