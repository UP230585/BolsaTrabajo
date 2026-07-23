import express from "express";
import cors from "cors";
import path from "node:path";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  // Los CVs subidos se sirven como archivos estáticos para poder mostrarlos
  // en la vista previa del validador.
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  app.use("/api/v1", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
