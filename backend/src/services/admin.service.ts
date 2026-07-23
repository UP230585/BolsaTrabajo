import { adminRepository } from "../repositories/admin.repository";
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

  aprobarEmpresa(id: number, aprobada: boolean) {
    // En una siguiente iteración aquí se dispararía el correo de notificación
    // a la empresa (HU-10: "al aprobar/rechazar, la empresa recibe un correo").
    return adminRepository.aprobarEmpresa(id, aprobada);
  },

  vacantesPendientes() {
    return adminRepository.vacantesPendientes();
  },

  aprobarVacante(id: number, aprobada: boolean) {
    return adminRepository.aprobarVacante(id, aprobada);
  },

  metricas() {
    return adminRepository.metricas();
  },
};
