import { z } from "zod";
import { Modalidad } from "@prisma/client";

export const crearVacanteSchema = z.object({
  titulo: z.string().min(3),
  descripcion: z.string().min(10),
  carreraId: z.number().int().positive(),
  cuatrimestreMin: z.number().int().min(1).max(9),
  modalidad: z.nativeEnum(Modalidad).default(Modalidad.PRESENCIAL),
  salario: z.number().positive().optional(),
});

export const filtrosVacanteSchema = z.object({
  carreraId: z.coerce.number().int().positive().optional(),
  cuatrimestre: z.coerce.number().int().min(1).max(9).optional(),
  modalidad: z.nativeEnum(Modalidad).optional(),
});

// Todos los campos opcionales: la empresa puede editar solo lo que cambió.
export const actualizarVacanteSchema = z.object({
  titulo: z.string().min(3).optional(),
  descripcion: z.string().min(10).optional(),
  carreraId: z.number().int().positive().optional(),
  cuatrimestreMin: z.number().int().min(1).max(9).optional(),
  modalidad: z.nativeEnum(Modalidad).optional(),
  salario: z.number().positive().optional(),
});

export const cambiarEstadoVacanteSchema = z.object({
  activa: z.boolean(),
});

export type CrearVacanteDTO = z.infer<typeof crearVacanteSchema>;
export type FiltrosVacanteDTO = z.infer<typeof filtrosVacanteSchema>;
export type ActualizarVacanteDTO = z.infer<typeof actualizarVacanteSchema>;
export type CambiarEstadoVacanteDTO = z.infer<typeof cambiarEstadoVacanteSchema>;
