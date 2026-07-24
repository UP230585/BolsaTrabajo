export type Rol = "ESTUDIANTE" | "EMPRESA" | "COORDINACION";

export interface Usuario {
  id: number;
  correo: string;
  rol: Rol;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface RegistroEstudianteInput {
  correo: string;
  password: string;
  matricula: string;
  carreraId: number;
  cuatrimestre: number;
}

export interface RegistroEmpresaInput {
  correo: string;
  password: string;
  razonSocial: string;
  rfc: string;
  giro: string;
}

export interface LoginInput {
  correo: string;
  password: string;
}

export interface ApiEnvelope<T> {
  data: T | null;
  error: string | null;
}
