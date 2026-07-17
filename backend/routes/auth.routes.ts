import { Router } from "express";
import { authController } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/register/estudiante", authController.registrarEstudiante);
authRouter.post("/register/empresa", authController.registrarEmpresa);
authRouter.post("/login", authController.login);
