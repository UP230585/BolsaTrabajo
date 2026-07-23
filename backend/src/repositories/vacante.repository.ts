import { prisma } from "../config/prisma";
import type { Modalidad } from "@prisma/client";
import type { FiltrosVacanteDTO } from "../dtos/vacante.dto";

export const vacanteRepository = {
  findMany(filtros: FiltrosVacanteDTO) {
    return prisma.vacante.findMany({
      where: {
        activa: true,
        aprobada: true,
        ...(filtros.carreraId ? { carreraId: filtros.carreraId } : {}),
        ...(filtros.cuatrimestre ? { cuatrimestreMin: { lte: filtros.cuatrimestre } } : {}),
        ...(filtros.modalidad ? { modalidad: filtros.modalidad as Modalidad } : {}),
      },
      include: { carrera: true, empresa: true },
      orderBy: { creadaEn: "desc" },
    });
  },

  findById(id: number) {
    return prisma.vacante.findUnique({
      where: { id },
      include: { carrera: true, empresa: true },
    });
  },

  findByEmpresa(empresaId: number) {
    return prisma.vacante.findMany({
      where: { empresaId },
      include: { carrera: true, _count: { select: { postulaciones: true } } },
      orderBy: { creadaEn: "desc" },
    });
  },

  create(empresaId: number, datos: {
    titulo: string;
    descripcion: string;
    carreraId: number;
    cuatrimestreMin: number;
    modalidad: Modalidad;
    salario?: number;
  }) {
    return prisma.vacante.create({
      data: { ...datos, empresaId, aprobada: false, activa: true },
    });
  },
};
