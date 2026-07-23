import { Router } from "express";
import { Rol } from "@prisma/client";
import { adminController } from "../controllers/admin.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(Rol.COORDINACION));

adminRouter.get("/users", adminController.listarUsuarios);
adminRouter.patch("/users/:id/status", adminController.cambiarEstadoUsuario);
adminRouter.get("/companies/pending", adminController.empresasPendientes);
adminRouter.patch("/companies/:id/approve", adminController.aprobarEmpresa);
adminRouter.get("/jobs/pending", adminController.vacantesPendientes);
adminRouter.patch("/jobs/:id/approve", adminController.aprobarVacante);
adminRouter.get("/metrics", adminController.metricas);
