import { Router } from "express";
import { Rol } from "@prisma/client";
import { vacanteController } from "../controllers/vacante.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

export const vacanteRouter = Router();

vacanteRouter.get("/", vacanteController.listar);
vacanteRouter.get("/mias", requireAuth, requireRole(Rol.EMPRESA), vacanteController.misVacantes);
vacanteRouter.get("/:id", vacanteController.detalle);
vacanteRouter.post("/", requireAuth, requireRole(Rol.EMPRESA), vacanteController.crear);
