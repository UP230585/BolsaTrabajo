import { api } from "./api";
import type {
  ApiEnvelope,
  LoginInput,
  LoginResponse,
  RegistroEstudianteInput,
  RegistroEmpresaInput,
} from "@/types/auth";

export async function loginRequest(input: LoginInput): Promise<LoginResponse> {
  const { data } = await api.post<ApiEnvelope<LoginResponse>>("/auth/login", input);
  if (!data.data) throw new Error(data.error ?? "No se pudo iniciar sesión");
  return data.data;
}

export async function registrarEstudianteRequest(
  input: RegistroEstudianteInput
): Promise<LoginResponse> {
  const { data } = await api.post<ApiEnvelope<LoginResponse>>(
    "/auth/register/estudiante",
    input
  );
  if (!data.data) throw new Error(data.error ?? "No se pudo completar el registro");
  return data.data;
}

export async function registrarEmpresaRequest(
  input: RegistroEmpresaInput
): Promise<LoginResponse> {
  const { data } = await api.post<ApiEnvelope<LoginResponse>>(
    "/auth/register/empresa",
    input
  );
  if (!data.data) throw new Error(data.error ?? "No se pudo completar el registro");
  return data.data;
}
