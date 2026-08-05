import { Router } from "express";
import { Rol } from "@prisma/client";
import { favoritoController } from "../controllers/favorito.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

export const favoritoRouter = Router();

favoritoRouter.use(requireAuth, requireRole(Rol.ESTUDIANTE));
favoritoRouter.get("/", favoritoController.misGuardadas);
favoritoRouter.post("/:vacanteId", favoritoController.guardar);
favoritoRouter.delete("/:vacanteId", favoritoController.quitar);
