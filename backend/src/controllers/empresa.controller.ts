import type { Request, Response } from "express";
import { empresaService } from "../services/empresa.service";
import { actualizarPerfilEmpresaSchema } from "../dtos/empresa.dto";

export const empresaController = {
  async miPerfil(req: Request, res: Response) {
    const perfil = await empresaService.obtenerPerfil(req.usuario!.userId);
    res.status(200).json({ data: perfil, error: null });
  },

  async actualizarPerfil(req: Request, res: Response) {
    const datos = actualizarPerfilEmpresaSchema.parse(req.body);
    const perfil = await empresaService.actualizarPerfil(req.usuario!.userId, datos);
    res.status(200).json({ data: perfil, error: null });
  },
};
