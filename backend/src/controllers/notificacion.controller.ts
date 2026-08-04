import type { Request, Response } from "express";
import { notificacionService } from "../services/notificacion.service";

export const notificacionController = {
  async listar(req: Request, res: Response) {
    const notificaciones = await notificacionService.listar(req.usuario!.userId);
    res.status(200).json({ data: notificaciones, error: null });
  },

  async marcarLeida(req: Request, res: Response) {
    const id = Number(req.params.id);
    await notificacionService.marcarLeida(id, req.usuario!.userId);
    res.status(200).json({ data: { ok: true }, error: null });
  },

  async marcarTodasLeidas(req: Request, res: Response) {
    await notificacionService.marcarTodasLeidas(req.usuario!.userId);
    res.status(200).json({ data: { ok: true }, error: null });
  },
};
