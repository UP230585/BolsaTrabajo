import { prisma } from "../config/prisma";

export const carreraRepository = {
  findAll() {
    return prisma.carrera.findMany({ orderBy: { nombre: "asc" } });
  },
};
