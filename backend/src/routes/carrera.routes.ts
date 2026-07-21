import { Router } from "express";
import { carreraController } from "../controllers/carrera.controller";

export const carreraRouter = Router();

carreraRouter.get("/", carreraController.listar);
