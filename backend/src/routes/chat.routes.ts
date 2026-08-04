import { Router } from "express";
import { Rol } from "@prisma/client";
import { chatController } from "../controllers/chat.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

export const chatRouter = Router();

chatRouter.use(requireAuth, requireRole(Rol.ESTUDIANTE, Rol.EMPRESA));

chatRouter.post("/iniciar", requireRole(Rol.ESTUDIANTE), chatController.iniciar);
chatRouter.get("/", chatController.misConversaciones);
chatRouter.get("/:id", chatController.conversacion);
chatRouter.get("/:id/mensajes", chatController.mensajes);
chatRouter.post("/:id/mensajes", chatController.enviar);
