import { prisma } from "../config/prisma";
import type { Rol } from "@prisma/client";

export const adminRepository = {
  listarUsuarios(rol?: Rol) {
    return prisma.usuario.findMany({
      where: rol ? { rol } : {},
      select: {
        id: true,
        correo: true,
        rol: true,
        activo: true,
        creadoEn: true,
        estudiante: { include: { carrera: true } },
        empresa: true,
      },
      orderBy: { id: "asc" },
    });
  },

  cambiarEstadoUsuario(id: number, activo: boolean) {
    return prisma.usuario.update({
      where: { id },
      data: { activo },
      select: { id: true, correo: true, rol: true, activo: true },
    });
  },

  empresasPendientes() {
    return prisma.empresa.findMany({
      where: { aprobada: false },
      include: { usuario: true },
      orderBy: { id: "asc" },
    });
  },

  aprobarEmpresa(id: number, aprobada: boolean) {
    return prisma.empresa.update({
      where: { id },
      data: { aprobada },
    });
  },

  vacantesPendientes() {
    return prisma.vacante.findMany({
      where: { aprobada: false },
      include: { empresa: true, carrera: true },
      orderBy: { id: "asc" },
    });
  },

  aprobarVacante(id: number, aprobada: boolean) {
    return prisma.vacante.update({
      where: { id },
      data: { aprobada },
    });
  },

  async metricas() {
    const inicioDelMes = new Date();
    inicioDelMes.setDate(1);
    inicioDelMes.setHours(0, 0, 0, 0);

    const [
      totalEstudiantes,
      estudiantesConCvCompleto,
      empresasActivas,
      vacantesPublicadasEsteMes,
      totalPostulaciones,
      postulacionesContratadas,
    ] = await Promise.all([
      prisma.estudiante.count(),
      prisma.estudiante.count({ where: { porcentajeCV: 100 } }),
      prisma.empresa.count({ where: { aprobada: true } }),
      prisma.vacante.count({ where: { creadaEn: { gte: inicioDelMes } } }),
      prisma.postulacion.count(),
      prisma.postulacion.count({ where: { estatus: "CONTRATADO" } }),
    ]);

    const porcentajeCvCompleto = totalEstudiantes > 0 ? Math.round((estudiantesConCvCompleto / totalEstudiantes) * 100) : 0;
    const tasaDeExito = totalPostulaciones > 0 ? Math.round((postulacionesContratadas / totalPostulaciones) * 100) : 0;

    return {
      totalEstudiantes,
      porcentajeCvCompleto,
      empresasActivas,
      vacantesPublicadasEsteMes,
      totalPostulaciones,
      postulacionesContratadas,
      tasaDeExito,
    };
  },
};
