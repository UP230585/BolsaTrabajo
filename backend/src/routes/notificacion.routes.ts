import { Router } from "express";
import { notificacionController } from "../controllers/notificacion.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const notificacionRouter = Router();

// Cualquier rol autenticado tiene notificaciones propias (estudiante,
// empresa o coordinación), así que aquí no se restringe por rol.
notificacionRouter.use(requireAuth);

notificacionRouter.get("/", notificacionController.listar);
notificacionRouter.patch("/read-all", notificacionController.marcarTodasLeidas);
notificacionRouter.patch("/:id/read", notificacionController.marcarLeida);
