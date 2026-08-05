import { prisma } from "../config/prisma";
import type { Modalidad, Prisma } from "@prisma/client";
import { VACANTES_POR_PAGINA, type FiltrosVacanteDTO } from "../dtos/vacante.dto";

function whereDeFiltros(filtros: FiltrosVacanteDTO): Prisma.VacanteWhereInput {
  return {
    activa: true,
    aprobada: true,
    ...(filtros.carreraId ? { carreraId: filtros.carreraId } : {}),
    ...(filtros.cuatrimestre ? { cuatrimestreMin: { lte: filtros.cuatrimestre } } : {}),
    ...(filtros.modalidad ? { modalidad: filtros.modalidad as Modalidad } : {}),
    ...(filtros.q
      ? {
          OR: [
            { titulo: { contains: filtros.q } },
            { descripcion: { contains: filtros.q } },
          ],
        }
      : {}),
  };
}

export const vacanteRepository = {
  async findMany(filtros: FiltrosVacanteDTO) {
    const where = whereDeFiltros(filtros);
    const [items, total] = await Promise.all([
      prisma.vacante.findMany({
        where,
        include: { carrera: true, empresa: true },
        orderBy: { creadaEn: "desc" },
        skip: (filtros.pagina - 1) * VACANTES_POR_PAGINA,
        take: VACANTES_POR_PAGINA,
      }),
      prisma.vacante.count({ where }),
    ]);
    return { items, total };
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
    fechaLimite?: Date;
  }) {
    return prisma.vacante.create({
      data: { ...datos, empresaId, aprobada: false, activa: true },
    });
  },

  update(id: number, datos: {
    titulo?: string | undefined;
    descripcion?: string | undefined;
    carreraId?: number | undefined;
    cuatrimestreMin?: number | undefined;
    modalidad?: Modalidad | undefined;
    salario?: number | undefined;
    fechaLimite?: Date | undefined;
    aprobada?: boolean | undefined;
  }) {
    // Spread condicional en vez de pasar "datos" tal cual: con
    // exactOptionalPropertyTypes, un campo ausente y uno presente con
    // valor undefined no son lo mismo, y Prisma solo acepta lo primero.
    return prisma.vacante.update({
      where: { id },
      data: {
        ...(datos.titulo !== undefined ? { titulo: datos.titulo } : {}),
        ...(datos.descripcion !== undefined ? { descripcion: datos.descripcion } : {}),
        ...(datos.carreraId !== undefined ? { carreraId: datos.carreraId } : {}),
        ...(datos.cuatrimestreMin !== undefined ? { cuatrimestreMin: datos.cuatrimestreMin } : {}),
        ...(datos.modalidad !== undefined ? { modalidad: datos.modalidad } : {}),
        ...(datos.salario !== undefined ? { salario: datos.salario } : {}),
        ...(datos.fechaLimite !== undefined ? { fechaLimite: datos.fechaLimite } : {}),
        ...(datos.aprobada !== undefined ? { aprobada: datos.aprobada } : {}),
      },
      include: { carrera: true, empresa: true },
    });
  },

  updateStatus(id: number, activa: boolean) {
    return prisma.vacante.update({
      where: { id },
      data: { activa },
      include: { carrera: true, empresa: true },
    });
  },
};
