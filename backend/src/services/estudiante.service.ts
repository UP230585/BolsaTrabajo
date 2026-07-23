import { estudianteRepository } from "../repositories/estudiante.repository";
import { cvAnalyzerService } from "./cv-analyzer.service";
import { AppError } from "../middlewares/error.middleware";
import type { ActualizarCvDTO, ActualizarPerfilDTO } from "../dtos/estudiante.dto";
import fs from "node:fs/promises";

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

  /**
   * Analiza automáticamente el PDF subido (HU-02) y guarda el resultado.
   * A diferencia de actualizarCv, aquí el estudiante no marca nada a mano:
   * el sistema detecta qué secciones trae el documento.
   */
  async analizarYGuardarCv(usuarioId: number, rutaArchivo: string, urlPublica: string) {
    const estudiante = await this.obtenerPerfil(usuarioId);

    let analisis;
    try {
      const buffer = await fs.readFile(rutaArchivo);
      analisis = await cvAnalyzerService.analizar(buffer);
    } catch {
      throw new AppError(
        "No se pudo leer el PDF. Verifica que no esté dañado ni protegido con contraseña.",
        400
      );
    }

    const cv = await estudianteRepository.upsertCv(
      estudiante.id,
      {
        archivoUrl: urlPublica,
        datosPersonales: analisis.datosPersonales,
        formacionAcademica: analisis.formacionAcademica,
        experienciaLaboral: analisis.experienciaLaboral,
        habilidadesTecnicas: analisis.habilidadesTecnicas,
        idiomas: analisis.idiomas,
        fotoPerfil: analisis.fotoPerfil,
      },
      analisis.porcentaje
    );

    if (analisis.porcentaje === 100) {
      await estudianteRepository.otorgarInsigniaSiNoExiste(estudiante.id, "Perfil Completo");
      await estudianteRepository.otorgarInsigniaSiNoExiste(estudiante.id, "CV Verificado");
    }

    return { ...cv, porcentaje: analisis.porcentaje, detalles: analisis.detalles };
  },
};
