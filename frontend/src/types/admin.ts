export interface UsuarioAdmin {
  id: number;
  correo: string;
  rol: "ESTUDIANTE" | "EMPRESA" | "COORDINACION";
  activo: boolean;
  creadoEn: string;
  estudiante?: { matricula: string; carrera: { clave: string } } | null;
  empresa?: { razonSocial: string } | null;
}

export interface EmpresaPendiente {
  id: number;
  razonSocial: string;
  rfc: string;
  giro: string;
  aprobada: boolean;
  usuario: { correo: string };
}

export interface VacantePendiente {
  id: number;
  titulo: string;
  aprobada: boolean;
  empresa: { razonSocial: string };
  carrera: { nombre: string };
}

export interface Metricas {
  totalEstudiantes: number;
  porcentajeCvCompleto: number;
  empresasActivas: number;
  vacantesPublicadasEsteMes: number;
  totalPostulaciones: number;
  postulacionesContratadas: number;
  tasaDeExito: number;
}
