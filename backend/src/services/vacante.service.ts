import { vacanteRepository } from "../repositories/vacante.repository";
import { AppError } from "../middlewares/error.middleware";
import type { CrearVacanteDTO, FiltrosVacanteDTO } from "../dtos/vacante.dto";

export const vacanteService = {
  listar(filtros: FiltrosVacanteDTO) {
    return vacanteRepository.findMany(filtros);
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
    const { salario, ...resto } = datos;
    return vacanteRepository.create(empresaId, {
      ...resto,
      ...(salario !== undefined ? { salario } : {}),
    });
  },
};
