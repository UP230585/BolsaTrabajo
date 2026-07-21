import type { Request, Response } from "express";
import { carreraRepository } from "../repositories/carrera.repository";

export const carreraController = {
  async listar(_req: Request, res: Response) {
    const carreras = await carreraRepository.findAll();
    res.status(200).json({ data: carreras, error: null });
  },
};
