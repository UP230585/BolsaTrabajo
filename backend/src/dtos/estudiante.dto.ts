import { z } from "zod";

// El validador de CV en esta etapa recibe "sí/no" de cada sección (no procesa
// el PDF todavía) y el sistema calcula el semáforo. Ver HU-02.
export const actualizarCvSchema = z.object({
  archivoUrl: z.string().min(1),
  datosPersonales: z.boolean(),
  formacionAcademica: z.boolean(),
  experienciaLaboral: z.boolean(),
  habilidadesTecnicas: z.boolean(),
  idiomas: z.boolean(),
  fotoPerfil: z.boolean(),
});

export const actualizarPerfilSchema = z.object({
  cuatrimestre: z.number().int().min(1).max(9).optional(),
  fotoUrl: z.string().optional(),
});

export type ActualizarCvDTO = z.infer<typeof actualizarCvSchema>;
export type ActualizarPerfilDTO = z.infer<typeof actualizarPerfilSchema>;
