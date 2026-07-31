import { Router } from "express";
import { authRouter } from "./auth.routes";
import { healthRouter } from "./health.routes";
import { carreraRouter } from "./carrera.routes";
import { vacanteRouter } from "./vacante.routes";
import { estudianteRouter } from "./estudiante.routes";
import { empresaRouter } from "./empresa.routes";
import { postulacionRouter } from "./postulacion.routes";
import { chatRouter } from "./chat.routes";
import { adminRouter } from "./admin.routes";
import { notificacionRouter } from "./notificacion.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/", healthRouter);
apiRouter.use("/carreras", carreraRouter);
apiRouter.use("/jobs", vacanteRouter);
apiRouter.use("/students", estudianteRouter);
apiRouter.use("/companies", empresaRouter);
apiRouter.use("/applications", postulacionRouter);
apiRouter.use("/chat", chatRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/notifications", notificacionRouter);
