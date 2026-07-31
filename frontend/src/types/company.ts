export interface PerfilEmpresa {
  id: number;
  razonSocial: string;
  rfc: string;
  giro: string;
  aprobada: boolean;
  usuario: { correo: string };
  _count: { vacantes: number };
}

export interface ActualizarPerfilEmpresaInput {
  razonSocial?: string;
  giro?: string;
}
