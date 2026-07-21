import { api } from "./api";
import type { ApiEnvelope } from "@/types/auth";
import type { PerfilEstudiante, ActualizarCvInput, CV } from "@/types/students";

export async function miPerfilRequest(): Promise<PerfilEstudiante> {
  const { data } = await api.get<ApiEnvelope<PerfilEstudiante>>("/students/me");
  if (!data.data) throw new Error(data.error ?? "No se pudo obtener el perfil");
  return data.data;
}

export async function actualizarCvRequest(input: ActualizarCvInput): Promise<CV> {
  const { data } = await api.put<ApiEnvelope<CV>>("/students/me/cv", input);
  if (!data.data) throw new Error(data.error ?? "No se pudo actualizar el CV");
  return data.data;
}
