import { Router } from "express";
import { Rol } from "@prisma/client";
import { postulacionController } from "../controllers/postulacion.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

export const postulacionRouter = Router();

postulacionRouter.post("/", requireAuth, requireRole(Rol.ESTUDIANTE), postulacionController.postularse);
postulacionRouter.get("/me", requireAuth, requireRole(Rol.ESTUDIANTE), postulacionController.misPostulaciones);
postulacionRouter.get("/empresa", requireAuth, requireRole(Rol.EMPRESA), postulacionController.postulacionesDeMiEmpresa);
postulacionRouter.patch("/:id", requireAuth, requireRole(Rol.EMPRESA), postulacionController.actualizarEstatus);
