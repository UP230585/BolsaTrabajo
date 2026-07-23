import { api } from "./api";
import type { ApiEnvelope } from "@/types/auth";
import type { EmpresaPendiente, VacantePendiente, Metricas } from "@/types/admin";

export async function empresasPendientesRequest(): Promise<EmpresaPendiente[]> {
  const { data } = await api.get<ApiEnvelope<EmpresaPendiente[]>>("/admin/companies/pending");
  return data.data ?? [];
}

export async function aprobarEmpresaRequest(id: number, aprobada: boolean): Promise<EmpresaPendiente> {
  const { data } = await api.patch<ApiEnvelope<EmpresaPendiente>>(`/admin/companies/${id}/approve`, { aprobada });
  if (!data.data) throw new Error(data.error ?? "No se pudo actualizar la empresa");
  return data.data;
}

export async function vacantesPendientesRequest(): Promise<VacantePendiente[]> {
  const { data } = await api.get<ApiEnvelope<VacantePendiente[]>>("/admin/jobs/pending");
  return data.data ?? [];
}

export async function aprobarVacanteRequest(id: number, aprobada: boolean): Promise<VacantePendiente> {
  const { data } = await api.patch<ApiEnvelope<VacantePendiente>>(`/admin/jobs/${id}/approve`, { aprobada });
  if (!data.data) throw new Error(data.error ?? "No se pudo actualizar la vacante");
  return data.data;
}

export async function metricasRequest(): Promise<Metricas> {
  const { data } = await api.get<ApiEnvelope<Metricas>>("/admin/metrics");
  if (!data.data) throw new Error(data.error ?? "No se pudieron obtener las métricas");
  return data.data;
}
