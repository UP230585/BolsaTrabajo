export type EmisorMensaje = "ESTUDIANTE" | "EMPRESA";

export interface Mensaje {
  id: number;
  conversacionId: number;
  emisorRol: EmisorMensaje;
  contenido: string;
  enviadoEn: string;
}

export interface Conversacion {
  id: number;
  estudianteId: number;
  empresaId: number;
  creadaEn: string;
  estudiante?: { usuario: { correo: string } };
  empresa?: { razonSocial: string };
  mensajes?: Mensaje[];
  contactoHabilitado: boolean;
}
