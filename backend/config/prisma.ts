import { PrismaClient } from "@prisma/client";

// Patrón singleton: evita abrir múltiples conexiones a MySQL en desarrollo
// (hot-reload de ts-node-dev crearía una instancia nueva en cada cambio).
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
