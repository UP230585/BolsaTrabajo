import { z } from "zod";
import { EstatusPostulacion } from "@prisma/client";

export const crearPostulacionSchema = z.object({
  vacanteId: z.number().int().positive(),
});

export const actualizarEstatusSchema = z.object({
  estatus: z.nativeEnum(EstatusPostulacion),
});

export type CrearPostulacionDTO = z.infer<typeof crearPostulacionSchema>;
export type ActualizarEstatusDTO = z.infer<typeof actualizarEstatusSchema>;
