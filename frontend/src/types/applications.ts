import type { Vacante, Carrera } from "./jobs";

export type EstatusPostulacion =
  | "POSTULADO"
  | "VISTO"
  | "EN_CONTACTO"
  | "ENTREVISTA"
  | "CONTRATADO"
  | "NO_SELECCIONADO";

export interface CvDePostulante {
  archivoUrl: string;
  porcentaje: number;
}

export interface EstudiantePostulante {
  id: number;
  matricula: string;
  carrera: Carrera;
  usuario: { correo: string };
  cv: CvDePostulante | null;
}

export interface Postulacion {
  id: number;
  estatus: EstatusPostulacion;
  creadaEn: string;
  actualizadaEn: string;
  vacante: Vacante;
  // Solo viene lleno en la vista de la empresa (postulacionesDeMiEmpresa);
  // en "mis postulaciones" del estudiante no aplica y llega undefined.
  estudiante?: EstudiantePostulante;
}

export const COLUMNAS_KANBAN: { estatus: EstatusPostulacion; titulo: string }[] = [
  { estatus: "POSTULADO", titulo: "Postulado" },
  { estatus: "VISTO", titulo: "Visto" },
  { estatus: "EN_CONTACTO", titulo: "En contacto" },
  { estatus: "ENTREVISTA", titulo: "Entrevista" },
  { estatus: "CONTRATADO", titulo: "Contratado" },
  { estatus: "NO_SELECCIONADO", titulo: "No seleccionado" },
];
