export interface Carrera {
  id: number;
  nombre: string;
  clave: string;
}

export type Modalidad = "PRESENCIAL" | "HIBRIDO" | "REMOTO";

export interface Vacante {
  id: number;
  titulo: string;
  descripcion: string;
  cuatrimestreMin: number;
  modalidad: Modalidad;
  salario: string | null;
  activa: boolean;
  aprobada: boolean;
  creadaEn: string;
  carrera: Carrera;
  empresa: { id: number; razonSocial: string };
  _count?: { postulaciones: number };
}

export interface CrearVacanteInput {
  titulo: string;
  descripcion: string;
  carreraId: number;
  cuatrimestreMin: number;
  modalidad: Modalidad;
  salario?: number;
}

export interface FiltrosVacantes {
  carreraId?: number;
  cuatrimestre?: number;
  modalidad?: Modalidad;
}

export interface ActualizarVacanteInput {
  titulo?: string;
  descripcion?: string;
  carreraId?: number;
  cuatrimestreMin?: number;
  modalidad?: Modalidad;
  salario?: number;
}
