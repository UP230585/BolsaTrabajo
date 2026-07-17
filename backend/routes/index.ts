import { Router } from "express";
import { authRouter } from "./auth.routes";
import { healthRouter } from "./health.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/", healthRouter);

// A partir de la Semana 2 se agregan aquí:
// apiRouter.use("/jobs", jobsRouter);
// apiRouter.use("/applications", applicationsRouter);
// apiRouter.use("/chat", chatRouter);
// apiRouter.use("/admin", adminRouter);
