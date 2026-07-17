import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import {
  registrarEstudianteSchema,
  registrarEmpresaSchema,
  loginSchema,
} from "../dtos/auth.dto";

export const authController = {
  async registrarEstudiante(req: Request, res: Response) {
    const datos = registrarEstudianteSchema.parse(req.body);
    const resultado = await authService.registrarEstudiante(datos);
    res.status(201).json({ data: resultado, error: null });
  },

  async registrarEmpresa(req: Request, res: Response) {
    const datos = registrarEmpresaSchema.parse(req.body);
    const resultado = await authService.registrarEmpresa(datos);
    res.status(201).json({ data: resultado, error: null });
  },

  async login(req: Request, res: Response) {
    const datos = loginSchema.parse(req.body);
    const resultado = await authService.login(datos);
    res.status(200).json({ data: resultado, error: null });
  },
};
