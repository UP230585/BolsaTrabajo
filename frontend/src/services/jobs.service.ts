import { api } from "./api";
import type { ApiEnvelope } from "@/types/auth";
import type { Vacante, CrearVacanteInput, FiltrosVacantes } from "@/types/jobs";

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
