import { Router } from "express";
import { Rol } from "@prisma/client";
import { empresaController } from "../controllers/empresa.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

export const empresaRouter = Router();

empresaRouter.use(requireAuth, requireRole(Rol.EMPRESA));

empresaRouter.get("/me", empresaController.miPerfil);
empresaRouter.put("/me", empresaController.actualizarPerfil);
