import type { NextFunction, Request, Response } from "express";
import type { Rol } from "@prisma/client";
import { verifyToken, type JwtPayload } from "../utils/jwt";
import { AppError } from "./error.middleware";

// Extiende el tipo Request de Express para exponer el usuario autenticado
// a los controladores (req.usuario).
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("No se proporcionó un token de autenticación", 401);
  }

  const token = header.slice("Bearer ".length);

  try {
    req.usuario = verifyToken(token);
    next();
  } catch {
    throw new AppError("Token inválido o expirado", 401);
  }
}

export function requireRole(...rolesPermitidos: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.usuario) {
      throw new AppError("No autenticado", 401);
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      throw new AppError("No tienes permisos para realizar esta acción", 403);
    }
    next();
  };
}
