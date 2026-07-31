import { api } from "./api";
import type { ApiEnvelope } from "@/types/auth";
import type { PerfilEmpresa, ActualizarPerfilEmpresaInput } from "@/types/company";

export async function miPerfilEmpresaRequest(): Promise<PerfilEmpresa> {
  const { data } = await api.get<ApiEnvelope<PerfilEmpresa>>("/companies/me");
  if (!data.data) throw new Error(data.error ?? "No se pudo obtener el perfil");
  return data.data;
}

export async function actualizarPerfilEmpresaRequest(
  input: ActualizarPerfilEmpresaInput
): Promise<PerfilEmpresa> {
  const { data } = await api.put<ApiEnvelope<PerfilEmpresa>>("/companies/me", input);
  if (!data.data) throw new Error(data.error ?? "No se pudo actualizar el perfil");
  return data.data;
}
