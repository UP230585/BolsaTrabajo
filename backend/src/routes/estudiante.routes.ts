import { Router } from "express";
import { Rol } from "@prisma/client";
import { estudianteController } from "../controllers/estudiante.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

export const estudianteRouter = Router();

estudianteRouter.use(requireAuth, requireRole(Rol.ESTUDIANTE));

estudianteRouter.get("/me", estudianteController.miPerfil);
estudianteRouter.put("/me", estudianteController.actualizarPerfil);
estudianteRouter.put("/me/cv", estudianteController.actualizarCv);
