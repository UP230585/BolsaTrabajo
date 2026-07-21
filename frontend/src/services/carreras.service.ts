import { api } from "./api";
import type { ApiEnvelope } from "@/types/auth";
import type { Carrera } from "@/types/jobs";

export async function listarCarrerasRequest(): Promise<Carrera[]> {
  const { data } = await api.get<ApiEnvelope<Carrera[]>>("/carreras");
  return data.data ?? [];
}
