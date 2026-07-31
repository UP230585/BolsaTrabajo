import { adminRepository } from "../repositories/admin.repository";
import { notificacionService } from "./notificacion.service";
import type { Rol } from "@prisma/client";

export const adminService = {
  listarUsuarios(rol?: Rol) {
    return adminRepository.listarUsuarios(rol);
  },

  cambiarEstadoUsuario(id: number, activo: boolean) {
    return adminRepository.cambiarEstadoUsuario(id, activo);
  },

  empresasPendientes() {
    return adminRepository.empresasPendientes();
  },

  async aprobarEmpresa(id: number, aprobada: boolean) {
    const empresa = await adminRepository.aprobarEmpresa(id, aprobada);

    await notificacionService.crear(
      empresa.usuarioId,
      "empresa",
      aprobada
        ? "Tu empresa fue aprobada por la Coordinación. Ya puedes publicar vacantes."
        : "Tu empresa fue rechazada por la Coordinación."
    );

    return empresa;
  },

  vacantesPendientes() {
    return adminRepository.vacantesPendientes();
  },

  async aprobarVacante(id: number, aprobada: boolean) {
    const vacante = await adminRepository.aprobarVacante(id, aprobada);

    await notificacionService.crear(
      vacante.empresa.usuarioId,
      "vacante",
      aprobada
        ? `Tu vacante "${vacante.titulo}" fue aprobada y ya es visible para estudiantes.`
        : `Tu vacante "${vacante.titulo}" fue rechazada por la Coordinación.`
    );

    return vacante;
  },

  metricas() {
    return adminRepository.metricas();
  },
};
