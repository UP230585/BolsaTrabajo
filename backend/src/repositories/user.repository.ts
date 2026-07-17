import { prisma } from "../config/prisma";
import type { Rol } from "@prisma/client";

export const userRepository = {
  findByEmail(correo: string) {
    return prisma.usuario.findUnique({
      where: { correo },
      include: { estudiante: true, empresa: true },
    });
  },

  findById(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      include: { estudiante: true, empresa: true },
    });
  },

  createEstudiante(data: {
    correo: string;
    passwordHash: string;
    matricula: string;
    carreraId: number;
    cuatrimestre: number;
  }) {
    return prisma.usuario.create({
      data: {
        correo: data.correo,
        password: data.passwordHash,
        rol: "ESTUDIANTE" as Rol,
        estudiante: {
          create: {
            matricula: data.matricula,
            carreraId: data.carreraId,
            cuatrimestre: data.cuatrimestre,
          },
        },
      },
      include: { estudiante: true },
    });
  },

  createEmpresa(data: {
    correo: string;
    passwordHash: string;
    razonSocial: string;
    rfc: string;
    giro: string;
  }) {
    return prisma.usuario.create({
      data: {
        correo: data.correo,
        password: data.passwordHash,
        rol: "EMPRESA" as Rol,
        empresa: {
          create: {
            razonSocial: data.razonSocial,
            rfc: data.rfc,
            giro: data.giro,
            aprobada: false,
          },
        },
      },
      include: { empresa: true },
    });
  },
};
