import { z } from "zod";

export const iniciarConversacionSchema = z.object({
  vacanteId: z.number().int().positive(),
});

export const enviarMensajeSchema = z.object({
  contenido: z.string().min(1, "El mensaje no puede estar vacío").max(2000),
});

export type IniciarConversacionDTO = z.infer<typeof iniciarConversacionSchema>;
export type EnviarMensajeDTO = z.infer<typeof enviarMensajeSchema>;
