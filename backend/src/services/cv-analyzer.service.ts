/**
 * Analizador automático de CV (HU-02).
 *
 * Extrae el texto de un PDF y detecta qué secciones están presentes usando
 * palabras clave y expresiones regulares. No usa IA: es un análisis por
 * heurísticas, suficiente y predecible para el alcance del proyecto, y fácil
 * de explicar y defender en la evaluación.
 */

export interface ResultadoAnalisisCv {
  datosPersonales: boolean;
  formacionAcademica: boolean;
  experienciaLaboral: boolean;
  habilidadesTecnicas: boolean;
  idiomas: boolean;
  fotoPerfil: boolean;
  porcentaje: number;
  detalles: {
    seccion: string;
    encontrado: boolean;
    evidencia: string | null;
  }[];
}

// Normaliza el texto: minúsculas y sin acentos, para que "Formación" y
// "formacion" se detecten igual.
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buscarPalabrasClave(texto: string, claves: string[]): string | null {
  for (const clave of claves) {
    if (texto.includes(normalizar(clave))) {
      return clave;
    }
  }
  return null;
}

const CLAVES_FORMACION = [
  "formacion academica", "educacion", "escolaridad", "estudios",
  "universidad", "licenciatura", "ingenieria", "bachillerato",
  "preparatoria", "carrera", "titulo", "egresado",
];

const CLAVES_EXPERIENCIA = [
  "experiencia laboral", "experiencia profesional", "experiencia",
  "practicas profesionales", "residencia", "empleo anterior",
  "puesto", "responsabilidades", "logros",
];

const CLAVES_HABILIDADES = [
  "habilidades", "competencias", "conocimientos tecnicos", "aptitudes",
  "tecnologias", "herramientas", "javascript", "python", "java", "sql",
  "react", "excel", "autocad", "solidworks", "photoshop",
];

const CLAVES_IDIOMAS = [
  "idiomas", "ingles", "english", "frances", "aleman", "toefl",
  "bilingue", "nivel de ingles", "b1", "b2", "c1",
];

export const cvAnalyzerService = {
  async analizar(bufferPdf: Buffer): Promise<ResultadoAnalisisCv> {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(bufferPdf) });

    let textoOriginal = "";
    let fotoPerfil = false;

    try {
      const resultadoTexto = await parser.getText();
      textoOriginal = resultadoTexto.text ?? "";

      // Detecta imágenes embebidas (la foto del CV). imageThreshold evita
      // contar iconos o líneas decorativas muy pequeñas como si fueran foto.
      const resultadoImagenes = await parser.getImage({ imageThreshold: 50 });
      fotoPerfil = resultadoImagenes.pages.some((pagina) => pagina.images.length > 0);
    } finally {
      await parser.destroy();
    }

    const texto = normalizar(textoOriginal);

    // --- Datos personales: correo o teléfono ---
    const correo = textoOriginal.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    const telefono = textoOriginal.match(/(\+?\d{2,3}[\s-]?)?\d{3}[\s-]?\d{3}[\s-]?\d{4}/);
    const datosPersonales = Boolean(correo || telefono);
    const evidenciaDatos = correo ? "correo electrónico" : telefono ? "número telefónico" : null;

    // --- Resto de secciones por palabras clave ---
    const claveFormacion = buscarPalabrasClave(texto, CLAVES_FORMACION);
    const claveExperiencia = buscarPalabrasClave(texto, CLAVES_EXPERIENCIA);
    const claveHabilidades = buscarPalabrasClave(texto, CLAVES_HABILIDADES);
    const claveIdiomas = buscarPalabrasClave(texto, CLAVES_IDIOMAS);

    const secciones = [
      { seccion: "Datos personales", encontrado: datosPersonales, evidencia: evidenciaDatos },
      { seccion: "Formación académica", encontrado: Boolean(claveFormacion), evidencia: claveFormacion },
      { seccion: "Experiencia laboral", encontrado: Boolean(claveExperiencia), evidencia: claveExperiencia },
      { seccion: "Habilidades técnicas", encontrado: Boolean(claveHabilidades), evidencia: claveHabilidades },
      { seccion: "Idiomas", encontrado: Boolean(claveIdiomas), evidencia: claveIdiomas },
      { seccion: "Foto de perfil", encontrado: fotoPerfil, evidencia: fotoPerfil ? "imagen embebida" : null },
    ];

    const completas = secciones.filter((s) => s.encontrado).length;
    const porcentaje = Math.round((completas / secciones.length) * 100);

    return {
      datosPersonales,
      formacionAcademica: Boolean(claveFormacion),
      experienciaLaboral: Boolean(claveExperiencia),
      habilidadesTecnicas: Boolean(claveHabilidades),
      idiomas: Boolean(claveIdiomas),
      fotoPerfil,
      porcentaje,
      detalles: secciones,
    };
  },
};
