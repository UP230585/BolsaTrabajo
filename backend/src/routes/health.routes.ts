import { Router } from "express";
import { Rol } from "@prisma/client";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

export const healthRouter = Router();

// Ruta pública: confirma que la API está viva (útil para Azure App Service health check).
healthRouter.get("/health", (_req, res) => {
  res.status(200).json({ data: { status: "ok" }, error: null });
});

// Ruta protegida de ejemplo: cualquier usuario autenticado.
healthRouter.get("/me", requireAuth, (req, res) => {
  res.status(200).json({ data: { usuario: req.usuario }, error: null });
});

// Ruta protegida de ejemplo: solo Coordinación (para probar requireRole).
healthRouter.get("/admin/ping", requireAuth, requireRole(Rol.COORDINACION), (_req, res) => {
  res.status(200).json({ data: { mensaje: "Acceso de Coordinación confirmado" }, error: null });
});
