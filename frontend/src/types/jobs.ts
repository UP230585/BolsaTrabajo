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
  fechaLimite: string | null;
  activa: boolean;
  aprobada: boolean;
  creadaEn: string;
  carrera: Carrera;
  empresa: { id: number; razonSocial: string };
  _count?: { postulaciones: number };
}

export interface VacantesPaginadas {
  items: Vacante[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export interface CrearVacanteInput {
  titulo: string;
  descripcion: string;
  carreraId: number;
  cuatrimestreMin: number;
  modalidad: Modalidad;
  salario?: number;
  fechaLimite?: string;
}

export interface FiltrosVacantes {
  carreraId?: number;
  cuatrimestre?: number;
  modalidad?: Modalidad;
  q?: string;
  pagina?: number;
}

export interface ActualizarVacanteInput {
  titulo?: string;
  descripcion?: string;
  carreraId?: number;
  cuatrimestreMin?: number;
  modalidad?: Modalidad;
  salario?: number;
  fechaLimite?: string;
}
