import type { Vacante } from "./jobs";

export type EstatusPostulacion =
  | "POSTULADO"
  | "VISTO"
  | "EN_CONTACTO"
  | "ENTREVISTA"
  | "CONTRATADO"
  | "NO_SELECCIONADO";

export interface Postulacion {
  id: number;
  estatus: EstatusPostulacion;
  creadaEn: string;
  actualizadaEn: string;
  vacante: Vacante;
}

export const COLUMNAS_KANBAN: { estatus: EstatusPostulacion; titulo: string }[] = [
  { estatus: "POSTULADO", titulo: "Postulado" },
  { estatus: "VISTO", titulo: "Visto" },
  { estatus: "EN_CONTACTO", titulo: "En contacto" },
  { estatus: "ENTREVISTA", titulo: "Entrevista" },
  { estatus: "CONTRATADO", titulo: "Contratado" },
  { estatus: "NO_SELECCIONADO", titulo: "No seleccionado" },
];
