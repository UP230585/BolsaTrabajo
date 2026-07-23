import type { Carrera } from "./jobs";

export interface CV {
  archivoUrl: string;
  datosPersonales: boolean;
  formacionAcademica: boolean;
  experienciaLaboral: boolean;
  habilidadesTecnicas: boolean;
  idiomas: boolean;
  fotoPerfil: boolean;
  porcentaje: number;
}

export interface PerfilEstudiante {
  id: number;
  matricula: string;
  cuatrimestre: number;
  fotoUrl: string | null;
  porcentajeCV: number;
  carrera: Carrera;
  cv: CV | null;
  insignias: { insignia: { nombre: string; icono: string } }[];
}

export interface DetalleAnalisisCv {
  seccion: string;
  encontrado: boolean;
  evidencia: string | null;
}

export interface ResultadoAnalisisCv extends CV {
  detalles: DetalleAnalisisCv[];
}

export interface ActualizarCvInput {
  archivoUrl: string;
  datosPersonales: boolean;
  formacionAcademica: boolean;
  experienciaLaboral: boolean;
  habilidadesTecnicas: boolean;
  idiomas: boolean;
  fotoPerfil: boolean;
}
