import { api } from "./api";
import type { ApiEnvelope } from "@/types/auth";
import type { Conversacion, Mensaje } from "@/types/chat";

export async function iniciarConversacionRequest(vacanteId: number): Promise<Conversacion> {
  const { data } = await api.post<ApiEnvelope<Conversacion>>("/chat/iniciar", { vacanteId });
  if (!data.data) throw new Error(data.error ?? "No se pudo iniciar la conversación");
  return data.data;
}

export async function misConversacionesRequest(): Promise<Conversacion[]> {
  const { data } = await api.get<ApiEnvelope<Conversacion[]>>("/chat");
  return data.data ?? [];
}

export async function obtenerMensajesRequest(conversacionId: number): Promise<Mensaje[]> {
  const { data } = await api.get<ApiEnvelope<Mensaje[]>>(`/chat/${conversacionId}/mensajes`);
  return data.data ?? [];
}

export async function enviarMensajeRequest(conversacionId: number, contenido: string): Promise<Mensaje> {
  const { data } = await api.post<ApiEnvelope<Mensaje>>(`/chat/${conversacionId}/mensajes`, { contenido });
  if (!data.data) throw new Error(data.error ?? "No se pudo enviar el mensaje");
  return data.data;
}
