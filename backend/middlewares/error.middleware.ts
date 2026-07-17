import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// Express 5 propaga automáticamente los rechazos de promesas de los
// controladores async a este middleware, no hace falta un wrapper try/catch.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      data: null,
      error: "Datos de entrada inválidos",
      detalles: err.issues.map((i) => ({ campo: i.path.join("."), mensaje: i.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ data: null, error: err.message });
  }

  console.error(err);
  return res.status(500).json({ data: null, error: "Error interno del servidor" });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ data: null, error: "Ruta no encontrada" });
}
