import { vacanteRepository } from "../repositories/vacante.repository";
import { AppError } from "../middlewares/error.middleware";
import { VACANTES_POR_PAGINA, type ActualizarVacanteDTO, type CrearVacanteDTO, type FiltrosVacanteDTO } from "../dtos/vacante.dto";

export const vacanteService = {
  async listar(filtros: FiltrosVacanteDTO) {
    const { items, total } = await vacanteRepository.findMany(filtros);
    return {
      items,
      total,
      pagina: filtros.pagina,
      totalPaginas: Math.max(1, Math.ceil(total / VACANTES_POR_PAGINA)),
    };
  },

  async obtener(id: number) {
    const vacante = await vacanteRepository.findById(id);
    if (!vacante) {
      throw new AppError("Vacante no encontrada", 404);
    }
    return vacante;
  },

  misVacantes(empresaId: number) {
    return vacanteRepository.findByEmpresa(empresaId);
  },

  crear(empresaId: number, datos: CrearVacanteDTO) {
    // Nace no aprobada: la Coordinación debe revisarla antes de que sea
    // visible en el listado público (HU-05, criterio de aceptación).
    const { salario, fechaLimite, ...resto } = datos;
    return vacanteRepository.create(empresaId, {
      ...resto,
      ...(salario !== undefined ? { salario } : {}),
      ...(fechaLimite !== undefined ? { fechaLimite } : {}),
    });
  },

  async actualizar(id: number, empresaId: number, datos: ActualizarVacanteDTO) {
    const vacante = await vacanteRepository.findById(id);
    if (!vacante) {
      throw new AppError("Vacante no encontrada", 404);
    }
    if (vacante.empresaId !== empresaId) {
      throw new AppError("No puedes editar una vacante que no es de tu empresa", 403);
    }
    // Editar el contenido de una vacante ya aprobada la regresa a revisión:
    // la Coordinación debe validar el cambio antes de que vuelva a ser
    // visible (mismo criterio que al crearla, HU-05).
    return vacanteRepository.update(id, { ...datos, aprobada: false });
  },

  async cambiarEstado(id: number, empresaId: number, activa: boolean) {
    const vacante = await vacanteRepository.findById(id);
    if (!vacante) {
      throw new AppError("Vacante no encontrada", 404);
    }
    if (vacante.empresaId !== empresaId) {
      throw new AppError("No puedes pausar una vacante que no es de tu empresa", 403);
    }
    // Pausar/activar no toca el contenido, así que no requiere volver a
    // pasar por aprobación de la Coordinación.
    return vacanteRepository.updateStatus(id, activa);
  },
};
