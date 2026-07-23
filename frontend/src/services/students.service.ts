import { api } from "./api";
import type { ApiEnvelope } from "@/types/auth";
import type { PerfilEstudiante, ActualizarCvInput, CV, ResultadoAnalisisCv } from "@/types/students";

/** Sube el PDF y devuelve el análisis automático de sus secciones (HU-02). */
export async function analizarCvRequest(archivo: File): Promise<ResultadoAnalisisCv> {
  const formData = new FormData();
  formData.append("cv", archivo);

  const { data } = await api.post<ApiEnvelope<ResultadoAnalisisCv>>(
    "/students/me/cv/analizar",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  if (!data.data) throw new Error(data.error ?? "No se pudo analizar el CV");
  return data.data;
}

export async function miPerfilRequest(): Promise<PerfilEstudiante> {
  const { data } = await api.get<ApiEnvelope<PerfilEstudiante>>("/students/me");
  if (!data.data) throw new Error(data.error ?? "No se pudo obtener el perfil");
  return data.data;
}

export async function actualizarCvRequest(input: ActualizarCvInput): Promise<CV> {
  const { data } = await api.put<ApiEnvelope<CV>>("/students/me/cv", input);
  if (!data.data) throw new Error(data.error ?? "No se pudo actualizar el CV");
  return data.data;
}
