import { adminRepository } from "../repositories/admin.repository";

export const adminService = {
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
