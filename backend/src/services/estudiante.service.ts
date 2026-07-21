import { estudianteRepository } from "../repositories/estudiante.repository";
import { AppError } from "../middlewares/error.middleware";
import type { ActualizarCvDTO, ActualizarPerfilDTO } from "../dtos/estudiante.dto";

const CAMPOS_CV = [
  "datosPersonales",
  "formacionAcademica",
  "experienciaLaboral",
  "habilidadesTecnicas",
  "idiomas",
  "fotoPerfil",
] as const;

function calcularPorcentaje(datos: ActualizarCvDTO): number {
  const completos = CAMPOS_CV.filter((campo) => datos[campo]).length;
  return Math.round((completos / CAMPOS_CV.length) * 100);
}

export const estudianteService = {
  async obtenerPerfil(usuarioId: number) {
    const estudiante = await estudianteRepository.findByUsuarioId(usuarioId);
    if (!estudiante) {
      throw new AppError("No se encontró un perfil de estudiante para esta cuenta", 404);
    }
    return estudiante;
  },

  async actualizarPerfil(usuarioId: number, datos: ActualizarPerfilDTO) {
    const estudiante = await this.obtenerPerfil(usuarioId);
    return estudianteRepository.actualizarPerfil(estudiante.id, datos);
  },

  async actualizarCv(usuarioId: number, datos: ActualizarCvDTO) {
    const estudiante = await this.obtenerPerfil(usuarioId);
    const porcentaje = calcularPorcentaje(datos);

    const cv = await estudianteRepository.upsertCv(estudiante.id, datos, porcentaje);

    // Insignias automáticas, ver HU-02.
    if (porcentaje === 100) {
      await estudianteRepository.otorgarInsigniaSiNoExiste(estudiante.id, "Perfil Completo");
      await estudianteRepository.otorgarInsigniaSiNoExiste(estudiante.id, "CV Verificado");
    }

    return { ...cv, porcentaje };
  },
};
