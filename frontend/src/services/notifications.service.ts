import { api } from "./api";
import type { ApiEnvelope } from "@/types/auth";
import type { Notificacion } from "@/types/notifications";

export async function misNotificacionesRequest(): Promise<Notificacion[]> {
  const { data } = await api.get<ApiEnvelope<Notificacion[]>>("/notifications");
  return data.data ?? [];
}

export async function marcarNotificacionLeidaRequest(id: number): Promise<void> {
  await api.patch<ApiEnvelope<{ ok: boolean }>>(`/notifications/${id}/read`);
}

export async function marcarTodasLeidasRequest(): Promise<void> {
  await api.patch<ApiEnvelope<{ ok: boolean }>>("/notifications/read-all");
}
