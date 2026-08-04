import { api } from "./api";
import type { ApiEnvelope } from "@/types/auth";
import type { EmpresaPendiente, VacantePendiente, Metricas, UsuarioAdmin } from "@/types/admin";

export async function listarUsuariosRequest(rol?: string): Promise<UsuarioAdmin[]> {
  const { data } = await api.get<ApiEnvelope<UsuarioAdmin[]>>("/admin/users", {
    params: rol ? { rol } : {},
  });
  return data.data ?? [];
}

export async function cambiarEstadoUsuarioRequest(id: number, activo: boolean): Promise<UsuarioAdmin> {
  const { data } = await api.patch<ApiEnvelope<UsuarioAdmin>>(`/admin/users/${id}/status`, { activo });
  if (!data.data) throw new Error(data.error ?? "No se pudo actualizar el usuario");
  return data.data;
}

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

// El navegador solo dispara la descarga si el archivo llega como blob, así
// que no basta con un <a href> normal: esa ruta requiere el token Bearer
// (el interceptor de axios en api.ts ya lo agrega).
function descargarBlob(blob: Blob, nombreArchivo: string): void {
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.URL.revokeObjectURL(url);
}

export async function descargarReporteExcelRequest(): Promise<void> {
  const { data } = await api.get<Blob>("/admin/reports/excel", { responseType: "blob" });
  descargarBlob(data, "reporte-bolsa-trabajo.xlsx");
}

export async function descargarReportePdfRequest(): Promise<void> {
  const { data } = await api.get<Blob>("/admin/reports/pdf", { responseType: "blob" });
  descargarBlob(data, "reporte-bolsa-trabajo.pdf");
}
