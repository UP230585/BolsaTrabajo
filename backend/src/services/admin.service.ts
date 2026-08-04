// Servicio exclusivo del rol COORDINACION: aprobación de empresas/vacantes,
// activación/desactivación de cuentas y métricas agregadas de la plataforma.
// La autorización por rol se valida en el middleware de rutas, no aquí.
import { adminRepository } from "../repositories/admin.repository";
import { notificacionService } from "./notificacion.service";
import type { Rol } from "@prisma/client";

export const adminService = {
  // Lista usuarios para el panel de administración; `rol` es opcional
  // y permite filtrar solo ESTUDIANTE, EMPRESA o COORDINACION.
  listarUsuarios(rol?: Rol) {
    return adminRepository.listarUsuarios(rol);
  },

  // Activa o desactiva una cuenta (ban/unban). Un usuario desactivado
  // no puede iniciar sesión (ver auth.service.login).
  cambiarEstadoUsuario(id: number, activo: boolean) {
    return adminRepository.cambiarEstadoUsuario(id, activo);
  },

  // Empresas registradas que aún no han sido revisadas por la Coordinación.
  empresasPendientes() {
    return adminRepository.empresasPendientes();
  },

  // Aprueba o rechaza el registro de una empresa. Al aprobarla se le habilita
  // publicar vacantes; en ambos casos se notifica al usuario del resultado.
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

  // Vacantes publicadas por empresas que aún esperan moderación.
  vacantesPendientes() {
    return adminRepository.vacantesPendientes();
  },

  // Aprueba o rechaza una vacante. Solo las vacantes aprobadas son visibles
  // para los estudiantes en el explorador; se notifica a la empresa dueña.
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

  // Métricas agregadas para el dashboard de Coordinación (HU-09): total de
  // estudiantes, % de CV completo, empresas activas, vacantes del mes, etc.
  metricas() {
    return adminRepository.metricas();
  },
};
