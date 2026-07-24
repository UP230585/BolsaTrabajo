import { api } from "./api";
import type { ApiEnvelope } from "@/types/auth";
import type { Postulacion, EstatusPostulacion } from "@/types/applications";

export async function postularseRequest(vacanteId: number): Promise<Postulacion> {
  const { data } = await api.post<ApiEnvelope<Postulacion>>("/applications", { vacanteId });
  if (!data.data) throw new Error(data.error ?? "No se pudo completar la postulación");
  return data.data;
}

export async function misPostulacionesRequest(): Promise<Postulacion[]> {
  const { data } = await api.get<ApiEnvelope<Postulacion[]>>("/applications/me");
  return data.data ?? [];
}

export async function postulacionesDeMiEmpresaRequest(): Promise<Postulacion[]> {
  const { data } = await api.get<ApiEnvelope<Postulacion[]>>("/applications/empresa");
  return data.data ?? [];
}

export async function actualizarEstatusRequest(
  id: number,
  estatus: EstatusPostulacion
): Promise<Postulacion> {
  const { data } = await api.patch<ApiEnvelope<Postulacion>>(`/applications/${id}`, { estatus });
  if (!data.data) throw new Error(data.error ?? "No se pudo actualizar el estatus");
  return data.data;
}
