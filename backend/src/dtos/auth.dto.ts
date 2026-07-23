import { z } from "zod";

// El correo de estudiante debe ser institucional (HU-01, criterio de aceptación).
// Dominio real de la UPA para alumnos: @alumnos.upa.edu.mx
const correoEstudianteSchema = z.string().email().refine((correo) => correo.endsWith("@alumnos.upa.edu.mx"), {
  message: "El correo de estudiante debe ser institucional (@alumnos.upa.edu.mx)",
});

export const registrarEstudianteSchema = z.object({
  correo: correoEstudianteSchema,
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  matricula: z.string().min(4),
  carreraId: z.number().int().positive(),
  cuatrimestre: z.number().int().min(1).max(9),
});

export const registrarEmpresaSchema = z.object({
  correo: z.string().email(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  razonSocial: z.string().min(2),
  rfc: z.string().min(12).max(13),
  giro: z.string().min(2),
});

export const loginSchema = z.object({
  correo: z.string().email(),
  password: z.string().min(1),
});

export type RegistrarEstudianteDTO = z.infer<typeof registrarEstudianteSchema>;
export type RegistrarEmpresaDTO = z.infer<typeof registrarEmpresaSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
