import { api } from "./api";
import type { ApiEnvelope } from "@/types/auth";
import type { Vacante, CrearVacanteInput, ActualizarVacanteInput, FiltrosVacantes } from "@/types/jobs";

export async function listarVacantesRequest(filtros: FiltrosVacantes = {}): Promise<Vacante[]> {
  const { data } = await api.get<ApiEnvelope<Vacante[]>>("/jobs", { params: filtros });
  return data.data ?? [];
}

export async function obtenerVacanteRequest(id: number): Promise<Vacante> {
  const { data } = await api.get<ApiEnvelope<Vacante>>(`/jobs/${id}`);
  if (!data.data) throw new Error(data.error ?? "Vacante no encontrada");
  return data.data;
}

export async function misVacantesRequest(): Promise<Vacante[]> {
  const { data } = await api.get<ApiEnvelope<Vacante[]>>("/jobs/mias");
  return data.data ?? [];
}

export async function crearVacanteRequest(input: CrearVacanteInput): Promise<Vacante> {
  const { data } = await api.post<ApiEnvelope<Vacante>>("/jobs", input);
  if (!data.data) throw new Error(data.error ?? "No se pudo publicar la vacante");
  return data.data;
}

export async function actualizarVacanteRequest(id: number, input: ActualizarVacanteInput): Promise<Vacante> {
  const { data } = await api.put<ApiEnvelope<Vacante>>(`/jobs/${id}`, input);
  if (!data.data) throw new Error(data.error ?? "No se pudo actualizar la vacante");
  return data.data;
}

export async function cambiarEstadoVacanteRequest(id: number, activa: boolean): Promise<Vacante> {
  const { data } = await api.patch<ApiEnvelope<Vacante>>(`/jobs/${id}/status`, { activa });
  if (!data.data) throw new Error(data.error ?? "No se pudo cambiar el estatus de la vacante");
  return data.data;
}
