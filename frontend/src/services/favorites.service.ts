import { api } from "./api";
import type { ApiEnvelope } from "@/types/auth";
import type { Vacante } from "@/types/jobs";

interface VacanteGuardada {
  id: number;
  vacante: Vacante;
}

export async function misGuardadasRequest(): Promise<VacanteGuardada[]> {
  const { data } = await api.get<ApiEnvelope<VacanteGuardada[]>>("/favorites");
  return data.data ?? [];
}

export async function guardarVacanteRequest(vacanteId: number): Promise<void> {
  await api.post(`/favorites/${vacanteId}`);
}

export async function quitarVacanteRequest(vacanteId: number): Promise<void> {
  await api.delete(`/favorites/${vacanteId}`);
}
