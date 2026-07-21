import type { Request, Response } from "express";
import { estudianteService } from "../services/estudiante.service";
import { actualizarCvSchema, actualizarPerfilSchema } from "../dtos/estudiante.dto";

export const estudianteController = {
  async miPerfil(req: Request, res: Response) {
    const perfil = await estudianteService.obtenerPerfil(req.usuario!.userId);
    res.status(200).json({ data: perfil, error: null });
  },

  async actualizarPerfil(req: Request, res: Response) {
    const datos = actualizarPerfilSchema.parse(req.body);
    const perfil = await estudianteService.actualizarPerfil(req.usuario!.userId, datos);
    res.status(200).json({ data: perfil, error: null });
  },

  async actualizarCv(req: Request, res: Response) {
    const datos = actualizarCvSchema.parse(req.body);
    const cv = await estudianteService.actualizarCv(req.usuario!.userId, datos);
    res.status(200).json({ data: cv, error: null });
  },
};
