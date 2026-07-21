import type { Request, Response } from "express";
import { postulacionService } from "../services/postulacion.service";
import { crearPostulacionSchema, actualizarEstatusSchema } from "../dtos/postulacion.dto";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../middlewares/error.middleware";

async function estudianteIdDelUsuario(userId: number): Promise<number> {
  const usuario = await userRepository.findById(userId);
  if (!usuario?.estudiante) {
    throw new AppError("Esta cuenta no tiene un perfil de estudiante asociado", 403);
  }
  return usuario.estudiante.id;
}

async function empresaIdDelUsuario(userId: number): Promise<number> {
  const usuario = await userRepository.findById(userId);
  if (!usuario?.empresa) {
    throw new AppError("Esta cuenta no tiene un perfil de empresa asociado", 403);
  }
  return usuario.empresa.id;
}

export const postulacionController = {
  async postularse(req: Request, res: Response) {
    const { vacanteId } = crearPostulacionSchema.parse(req.body);
    const estudianteId = await estudianteIdDelUsuario(req.usuario!.userId);
    const postulacion = await postulacionService.postularse(estudianteId, vacanteId);
    res.status(201).json({ data: postulacion, error: null });
  },

  async misPostulaciones(req: Request, res: Response) {
    const estudianteId = await estudianteIdDelUsuario(req.usuario!.userId);
    const postulaciones = await postulacionService.misPostulaciones(estudianteId);
    res.status(200).json({ data: postulaciones, error: null });
  },

  async postulacionesDeMiEmpresa(req: Request, res: Response) {
    const empresaId = await empresaIdDelUsuario(req.usuario!.userId);
    const postulaciones = await postulacionService.postulacionesDeMiEmpresa(empresaId);
    res.status(200).json({ data: postulaciones, error: null });
  },

  async actualizarEstatus(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { estatus } = actualizarEstatusSchema.parse(req.body);
    const empresaId = await empresaIdDelUsuario(req.usuario!.userId);
    const postulacion = await postulacionService.actualizarEstatus(id, empresaId, estatus);
    res.status(200).json({ data: postulacion, error: null });
  },
};
