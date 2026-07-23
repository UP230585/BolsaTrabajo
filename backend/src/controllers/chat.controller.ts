import type { Request, Response } from "express";
import { chatService } from "../services/chat.service";
import { iniciarConversacionSchema, enviarMensajeSchema } from "../dtos/chat.dto";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../middlewares/error.middleware";
import { EmisorMensaje, Rol } from "@prisma/client";

async function perfilDelUsuario(userId: number): Promise<{ estudianteId?: number; empresaId?: number; rol: Rol }> {
  const usuario = await userRepository.findById(userId);
  if (!usuario) {
    throw new AppError("Usuario no encontrado", 404);
  }
  return {
    ...(usuario.estudiante ? { estudianteId: usuario.estudiante.id } : {}),
    ...(usuario.empresa ? { empresaId: usuario.empresa.id } : {}),
    rol: usuario.rol,
  };
}

export const chatController = {
  async iniciar(req: Request, res: Response) {
    const { vacanteId } = iniciarConversacionSchema.parse(req.body);
    const perfil = await perfilDelUsuario(req.usuario!.userId);
    if (!perfil.estudianteId) {
      throw new AppError("Solo un estudiante puede iniciar esta conversación", 403);
    }
    const conversacion = await chatService.iniciarDesdeVacante(perfil.estudianteId, vacanteId);
    res.status(201).json({ data: conversacion, error: null });
  },

  async misConversaciones(req: Request, res: Response) {
    const perfil = await perfilDelUsuario(req.usuario!.userId);
    const conversaciones = perfil.estudianteId
      ? await chatService.misConversacionesEstudiante(perfil.estudianteId)
      : await chatService.misConversacionesEmpresa(perfil.empresaId!);
    res.status(200).json({ data: conversaciones, error: null });
  },

  async mensajes(req: Request, res: Response) {
    const conversacionId = Number(req.params.id);
    const perfil = await perfilDelUsuario(req.usuario!.userId);
    const mensajes = await chatService.obtenerMensajes(conversacionId, perfil);
    res.status(200).json({ data: mensajes, error: null });
  },

  async enviar(req: Request, res: Response) {
    const conversacionId = Number(req.params.id);
    const { contenido } = enviarMensajeSchema.parse(req.body);
    const perfil = await perfilDelUsuario(req.usuario!.userId);
    const emisorRol = perfil.estudianteId ? EmisorMensaje.ESTUDIANTE : EmisorMensaje.EMPRESA;
    const mensaje = await chatService.enviarMensaje(conversacionId, perfil, emisorRol, contenido);
    res.status(201).json({ data: mensaje, error: null });
  },
};
