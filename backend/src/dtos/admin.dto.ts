import { z } from "zod";

export const aprobarSchema = z.object({
  aprobada: z.boolean(),
});

export type AprobarDTO = z.infer<typeof aprobarSchema>;