import { z } from "zod";

// El RFC no es editable aquí: es el identificador legal de la empresa,
// verificado por la Coordinación al aprobarla (ver empresa.aprobada).
export const actualizarPerfilEmpresaSchema = z.object({
  razonSocial: z.string().min(2).optional(),
  giro: z.string().min(2).optional(),
});

export type ActualizarPerfilEmpresaDTO = z.infer<typeof actualizarPerfilEmpresaSchema>;
