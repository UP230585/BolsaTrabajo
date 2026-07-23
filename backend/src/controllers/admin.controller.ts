import type { Request, Response } from "express";
import { adminService } from "../services/admin.service";
import { aprobarSchema } from "../dtos/admin.dto";

export const adminController = {
  async empresasPendientes(_req: Request, res: Response) {
    const empresas = await adminService.empresasPendientes();
    res.status(200).json({ data: empresas, error: null });
  },

  async aprobarEmpresa(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { aprobada } = aprobarSchema.parse(req.body);
    const empresa = await adminService.aprobarEmpresa(id, aprobada);
    res.status(200).json({ data: empresa, error: null });
  },

  async vacantesPendientes(_req: Request, res: Response) {
    const vacantes = await adminService.vacantesPendientes();
    res.status(200).json({ data: vacantes, error: null });
  },

  async aprobarVacante(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { aprobada } = aprobarSchema.parse(req.body);
    const vacante = await adminService.aprobarVacante(id, aprobada);
    res.status(200).json({ data: vacante, error: null });
  },

  async metricas(_req: Request, res: Response) {
    const metricas = await adminService.metricas();
    res.status(200).json({ data: metricas, error: null });
  },
};
