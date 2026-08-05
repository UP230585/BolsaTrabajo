import type { Request, Response } from "express";
import { favoritoService } from "../services/favorito.service";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../middlewares/error.middleware";

async function estudianteIdDelUsuario(userId: number): Promise<number> {
  const usuario = await userRepository.findById(userId);
  if (!usuario?.estudiante) {
    throw new AppError("Esta cuenta no tiene un perfil de estudiante asociado", 403);
  }
  return usuario.estudiante.id;
}

export const favoritoController = {
  async guardar(req: Request, res: Response) {
    const vacanteId = Number(req.params.vacanteId);
    const estudianteId = await estudianteIdDelUsuario(req.usuario!.userId);
    const favorito = await favoritoService.guardar(estudianteId, vacanteId);
    res.status(201).json({ data: favorito, error: null });
  },

  async quitar(req: Request, res: Response) {
    const vacanteId = Number(req.params.vacanteId);
    const estudianteId = await estudianteIdDelUsuario(req.usuario!.userId);
    await favoritoService.quitar(estudianteId, vacanteId);
    res.status(200).json({ data: { ok: true }, error: null });
  },

  async misGuardadas(req: Request, res: Response) {
    const estudianteId = await estudianteIdDelUsuario(req.usuario!.userId);
    const guardadas = await favoritoService.misGuardadas(estudianteId);
    res.status(200).json({ data: guardadas, error: null });
  },
};
