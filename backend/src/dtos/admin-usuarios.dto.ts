import { z } from "zod";

export const cambiarEstadoUsuarioSchema = z.object({
  activo: z.boolean(),
});

export type CambiarEstadoUsuarioDTO = z.infer<typeof cambiarEstadoUsuarioSchema>;
