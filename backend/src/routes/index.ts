import { Router } from "express";
import { authRouter } from "./auth.routes";
import { healthRouter } from "./health.routes";
import { carreraRouter } from "./carrera.routes";
import { vacanteRouter } from "./vacante.routes";
import { estudianteRouter } from "./estudiante.routes";
import { postulacionRouter } from "./postulacion.routes";
import { chatRouter } from "./chat.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/", healthRouter);
apiRouter.use("/carreras", carreraRouter);
apiRouter.use("/jobs", vacanteRouter);
apiRouter.use("/students", estudianteRouter);
apiRouter.use("/applications", postulacionRouter);
apiRouter.use("/chat", chatRouter);

// julieta agrega aquí en su rama:
// apiRouter.use("/admin", adminRouter);
