import type { Request, Response } from "express";
import { vacanteService } from "../services/vacante.service";
import {
  crearVacanteSchema,
  filtrosVacanteSchema,
  actualizarVacanteSchema,
  cambiarEstadoVacanteSchema,
} from "../dtos/vacante.dto";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../middlewares/error.middleware";

async function empresaIdDelUsuarioAutenticado(userId: number): Promise<number> {
  const usuario = await userRepository.findById(userId);
  if (!usuario?.empresa) {
    throw new AppError("Esta cuenta no tiene un perfil de empresa asociado", 403);
  }
  return usuario.empresa.id;
}

export const vacanteController = {
  async listar(req: Request, res: Response) {
    const filtros = filtrosVacanteSchema.parse(req.query);
    const vacantes = await vacanteService.listar(filtros);
    res.status(200).json({ data: vacantes, error: null });
  },

  async detalle(req: Request, res: Response) {
    const id = Number(req.params.id);
    const vacante = await vacanteService.obtener(id);
    res.status(200).json({ data: vacante, error: null });
  },

  async misVacantes(req: Request, res: Response) {
    const empresaId = await empresaIdDelUsuarioAutenticado(req.usuario!.userId);
    const vacantes = await vacanteService.misVacantes(empresaId);
    res.status(200).json({ data: vacantes, error: null });
  },

  async crear(req: Request, res: Response) {
    const empresaId = await empresaIdDelUsuarioAutenticado(req.usuario!.userId);
    const datos = crearVacanteSchema.parse(req.body);
    const vacante = await vacanteService.crear(empresaId, datos);
    res.status(201).json({ data: vacante, error: null });
  },

  async actualizar(req: Request, res: Response) {
    const empresaId = await empresaIdDelUsuarioAutenticado(req.usuario!.userId);
    const id = Number(req.params.id);
    const datos = actualizarVacanteSchema.parse(req.body);
    const vacante = await vacanteService.actualizar(id, empresaId, datos);
    res.status(200).json({ data: vacante, error: null });
  },

  async cambiarEstado(req: Request, res: Response) {
    const empresaId = await empresaIdDelUsuarioAutenticado(req.usuario!.userId);
    const id = Number(req.params.id);
    const { activa } = cambiarEstadoVacanteSchema.parse(req.body);
    const vacante = await vacanteService.cambiarEstado(id, empresaId, activa);
    res.status(200).json({ data: vacante, error: null });
  },
};
