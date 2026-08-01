import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { adminRepository } from "../repositories/admin.repository";

const ETIQUETAS_METRICAS: { clave: string; etiqueta: string }[] = [
  { clave: "totalEstudiantes", etiqueta: "Estudiantes registrados" },
  { clave: "porcentajeCvCompleto", etiqueta: "% con CV completo" },
  { clave: "empresasActivas", etiqueta: "Empresas activas" },
  { clave: "vacantesPublicadasEsteMes", etiqueta: "Vacantes este mes" },
  { clave: "totalPostulaciones", etiqueta: "Postulaciones totales" },
  { clave: "postulacionesContratadas", etiqueta: "Contratados" },
  { clave: "tasaDeExito", etiqueta: "Tasa de éxito" },
];

const ETIQUETA_ESTATUS: Record<string, string> = {
  POSTULADO: "Postulado",
  VISTO: "Visto",
  EN_CONTACTO: "En contacto",
  ENTREVISTA: "Entrevista",
  CONTRATADO: "Contratado",
  NO_SELECCIONADO: "No seleccionado",
};

const ETIQUETA_MODALIDAD: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  REMOTO: "Remoto",
};

async function obtenerDatosDelReporte() {
  const [
    metricas,
    usuarios,
    vacantes,
    postulaciones,
    empresas,
    carreras,
    postulacionesPorEstatus,
  ] = await Promise.all([
    adminRepository.metricas(),
    adminRepository.listarUsuarios(),
    adminRepository.listarVacantesCompleto(),
    adminRepository.listarPostulacionesCompleto(),
    adminRepository.listarEmpresasCompleto(),
    adminRepository.estudiantesPorCarrera(),
    adminRepository.postulacionesPorEstatus(),
  ]);

  const filasUsuarios = usuarios.map((u) => ({
    nombre: u.estudiante
  ? (u.estudiante.nombreCompleto ?? u.estudiante.matricula)
  : u.empresa
    ? u.empresa.razonSocial
    : "—",
    correo: u.correo,
    rol: u.rol,
    detalle: u.estudiante
      ? `${u.estudiante.matricula} · ${u.estudiante.carrera.clave}`
      : u.empresa
        ? `${u.empresa.giro} · ${u.empresa.aprobada ? "Aprobada" : "Pendiente de aprobación"}`
        : "—",
    estado: u.activo ? "Activo" : "Desactivado",
    creadoEn: u.creadoEn,
  }));

  const filasVacantes = vacantes.map((v) => ({
    titulo: v.titulo,
    empresa: v.empresa.razonSocial,
    carrera: v.carrera.clave,
    modalidad: ETIQUETA_MODALIDAD[v.modalidad] ?? v.modalidad,
    cuatrimestreMin: v.cuatrimestreMin,
    salario: v.salario !== null ? Number(v.salario.toString()) : null,
    estado: !v.aprobada ? "Pendiente de aprobación" : v.activa ? "Activa" : "Pausada",
    postulaciones: v._count.postulaciones,
    creadaEn: v.creadaEn,
  }));

  const filasPostulaciones = postulaciones.map((p) => ({
    estudiante: p.estudiante.nombreCompleto ?? p.estudiante.matricula,
    matricula: p.estudiante.matricula,
    carrera: p.estudiante.carrera.clave,
    correo: p.estudiante.usuario.correo,
    vacante: p.vacante.titulo,
    empresa: p.vacante.empresa.razonSocial,
    estatus: ETIQUETA_ESTATUS[p.estatus] ?? p.estatus,
    creadaEn: p.creadaEn,
    actualizadaEn: p.actualizadaEn,
  }));

  const filasEmpresas = empresas.map((e) => ({
    razonSocial: e.razonSocial,
    rfc: e.rfc,
    giro: e.giro,
    correo: e.usuario.correo,
    estado: e.aprobada ? "Aprobada" : "Pendiente de aprobación",
    vacantesPublicadas: e._count.vacantes,
  }));

  const filasCarreras = carreras.map((c) => ({
    carrera: c.nombre,
    clave: c.clave,
    estudiantes: c._count.estudiantes,
    vacantes: c._count.vacantes,
  }));

  const filasEstatus = postulacionesPorEstatus.map((f) => ({
    estatus: ETIQUETA_ESTATUS[f.estatus] ?? f.estatus,
    total: f._count,
  }));

  return {
    metricas,
    filasUsuarios,
    filasVacantes,
    filasPostulaciones,
    filasEmpresas,
    filasCarreras,
    filasEstatus,
  };
}

export const reporteService = {
  async generarExcel(): Promise<ExcelJS.Buffer> {
    const {
      metricas,
      filasUsuarios,
      filasVacantes,
      filasPostulaciones,
      filasEmpresas,
      filasCarreras,
      filasEstatus,
    } = await obtenerDatosDelReporte();

    const libro = new ExcelJS.Workbook();
    libro.creator = "Bolsa de Trabajo UPA";
    libro.created = new Date();

    // --- Resumen: métricas generales + desgloses por carrera y por estatus ---
    const hojaResumen = libro.addWorksheet("Resumen");
    hojaResumen.columns = [
      { header: "Indicador", key: "etiqueta", width: 32 },
      { header: "Valor", key: "valor", width: 15 },
    ];
    hojaResumen.getRow(1).font = { bold: true };
    hojaResumen.addRow({ etiqueta: "Generado el", valor: new Date().toLocaleString("es-MX") });
    hojaResumen.addRow({});
    for (const { clave, etiqueta } of ETIQUETAS_METRICAS) {
      hojaResumen.addRow({ etiqueta, valor: (metricas as Record<string, number>)[clave] });
    }

    hojaResumen.addRow({});
    const filaEncabezadoCarreras = hojaResumen.addRow({ etiqueta: "Estudiantes por carrera" });
    filaEncabezadoCarreras.font = { bold: true };
    hojaResumen.addRow({ etiqueta: "Carrera", valor: "Estudiantes / Vacantes" }).font = { italic: true };
    for (const c of filasCarreras) {
      hojaResumen.addRow({ etiqueta: `${c.carrera} (${c.clave})`, valor: `${c.estudiantes} / ${c.vacantes}` });
    }

    hojaResumen.addRow({});
    const filaEncabezadoEstatus = hojaResumen.addRow({ etiqueta: "Postulaciones por estatus" });
    filaEncabezadoEstatus.font = { bold: true };
    for (const e of filasEstatus) {
      hojaResumen.addRow({ etiqueta: e.estatus, valor: e.total });
    }

    // --- Usuarios ---
    const hojaUsuarios = libro.addWorksheet("Usuarios");
    hojaUsuarios.columns = [
      { header: "Nombre / Razón social", key: "nombre", width: 32 },
      { header: "Correo", key: "correo", width: 32 },
      { header: "Rol", key: "rol", width: 14 },
      { header: "Detalle", key: "detalle", width: 34 },
      { header: "Estado", key: "estado", width: 14 },
      { header: "Registrado", key: "creadoEn", width: 18 },
    ];
    hojaUsuarios.getRow(1).font = { bold: true };
    for (const fila of filasUsuarios) {
      hojaUsuarios.addRow({ ...fila, creadoEn: new Date(fila.creadoEn).toLocaleDateString("es-MX") });
    }

    // --- Vacantes ---
    const hojaVacantes = libro.addWorksheet("Vacantes");
    hojaVacantes.columns = [
      { header: "Título", key: "titulo", width: 30 },
      { header: "Empresa", key: "empresa", width: 28 },
      { header: "Carrera", key: "carrera", width: 12 },
      { header: "Modalidad", key: "modalidad", width: 14 },
      { header: "Cuatrimestre mín.", key: "cuatrimestreMin", width: 16 },
      { header: "Salario", key: "salario", width: 14 },
      { header: "Estado", key: "estado", width: 22 },
      { header: "Postulaciones", key: "postulaciones", width: 14 },
      { header: "Publicada", key: "creadaEn", width: 18 },
    ];
    hojaVacantes.getRow(1).font = { bold: true };
    for (const fila of filasVacantes) {
      hojaVacantes.addRow({ ...fila, creadaEn: new Date(fila.creadaEn).toLocaleDateString("es-MX") });
    }

    // --- Postulaciones ---
    const hojaPostulaciones = libro.addWorksheet("Postulaciones");
    hojaPostulaciones.columns = [
      { header: "Estudiante", key: "estudiante", width: 28 },
      { header: "Matrícula", key: "matricula", width: 14 },
      { header: "Carrera", key: "carrera", width: 10 },
      { header: "Correo", key: "correo", width: 30 },
      { header: "Vacante", key: "vacante", width: 28 },
      { header: "Empresa", key: "empresa", width: 26 },
      { header: "Estatus", key: "estatus", width: 16 },
      { header: "Postulado el", key: "creadaEn", width: 16 },
      { header: "Última actualización", key: "actualizadaEn", width: 18 },
    ];
    hojaPostulaciones.getRow(1).font = { bold: true };
    for (const fila of filasPostulaciones) {
      hojaPostulaciones.addRow({
        ...fila,
        creadaEn: new Date(fila.creadaEn).toLocaleDateString("es-MX"),
        actualizadaEn: new Date(fila.actualizadaEn).toLocaleDateString("es-MX"),
      });
    }

    // --- Empresas ---
    const hojaEmpresas = libro.addWorksheet("Empresas");
    hojaEmpresas.columns = [
      { header: "Razón social", key: "razonSocial", width: 30 },
      { header: "RFC", key: "rfc", width: 16 },
      { header: "Giro", key: "giro", width: 22 },
      { header: "Correo", key: "correo", width: 30 },
      { header: "Estado", key: "estado", width: 22 },
      { header: "Vacantes publicadas", key: "vacantesPublicadas", width: 18 },
    ];
    hojaEmpresas.getRow(1).font = { bold: true };
    for (const fila of filasEmpresas) {
      hojaEmpresas.addRow(fila);
    }

    return libro.xlsx.writeBuffer();
  },

  async generarPdf(): Promise<Buffer> {
    const {
      metricas,
      filasUsuarios,
      filasVacantes,
      filasPostulaciones,
      filasEmpresas,
      filasCarreras,
      filasEstatus,
    } = await obtenerDatosDelReporte();

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, bufferPages: true });
      const trozos: Buffer[] = [];
      doc.on("data", (trozo) => trozos.push(trozo));
      doc.on("end", () => resolve(Buffer.concat(trozos)));
      doc.on("error", reject);

      function tituloSeccion(texto: string) {
        doc.moveDown(1.2);
        doc.fillColor("#0b2545").fontSize(14).text(texto);
        doc.moveDown(0.3);
        doc.fillColor("#000000").fontSize(9);
      }

      doc.fontSize(18).fillColor("#0b2545").text("Reporte — Bolsa de Trabajo UPA", { align: "center" });
      doc.fontSize(10).fillColor("#666666").text(new Date().toLocaleString("es-MX"), { align: "center" });

      tituloSeccion("Métricas generales");
      doc.fontSize(11);
      for (const { clave, etiqueta } of ETIQUETAS_METRICAS) {
        const valor = (metricas as Record<string, number>)[clave];
        doc.text(`${etiqueta}: ${valor}`);
      }

      tituloSeccion("Estudiantes por carrera");
      doc.fontSize(10);
      for (const c of filasCarreras) {
        doc.text(`${c.carrera} (${c.clave}): ${c.estudiantes} estudiante(s) · ${c.vacantes} vacante(s)`);
      }

      tituloSeccion("Postulaciones por estatus");
      doc.fontSize(10);
      for (const e of filasEstatus) {
        doc.text(`${e.estatus}: ${e.total}`);
      }

      tituloSeccion(`Empresas registradas (${filasEmpresas.length})`);
      doc.fontSize(9);
      for (const e of filasEmpresas) {
        doc.text(
          `${e.razonSocial}  ·  RFC ${e.rfc}  ·  ${e.giro}  ·  ${e.correo}  ·  ${e.estado}  ·  ${e.vacantesPublicadas} vacante(s)`
        );
      }

      tituloSeccion(`Vacantes publicadas (${filasVacantes.length})`);
      doc.fontSize(9);
      for (const v of filasVacantes) {
        const salario = v.salario ? `$${v.salario.toLocaleString("es-MX")}` : "No especificado";
        doc.text(
          `${v.titulo}  ·  ${v.empresa}  ·  ${v.carrera}  ·  ${v.modalidad}  ·  desde ${v.cuatrimestreMin}° cuatri  ·  ${salario}  ·  ${v.estado}  ·  ${v.postulaciones} postulación(es)`
        );
      }

      tituloSeccion(`Postulaciones (${filasPostulaciones.length})`);
      doc.fontSize(9);
      for (const p of filasPostulaciones) {
        doc.text(
          `${p.estudiante} (${p.matricula}, ${p.carrera})  →  ${p.vacante} @ ${p.empresa}  ·  ${p.estatus}  ·  postulado ${new Date(p.creadaEn).toLocaleDateString("es-MX")}`
        );
      }

      tituloSeccion(`Usuarios registrados (${filasUsuarios.length})`);
      doc.fontSize(9);
      for (const fila of filasUsuarios) {
        doc.text(`${fila.nombre}  ·  ${fila.correo}  ·  ${fila.rol}  ·  ${fila.detalle}  ·  ${fila.estado}`);
      }

      // Numeración de páginas al final, ya con el total de páginas conocido.
      const rango = doc.bufferedPageRange();
      for (let i = 0; i < rango.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor("#999999").text(
          `Página ${i + 1} de ${rango.count}`,
          40,
          doc.page.height - 30,
          { align: "center", width: doc.page.width - 80 }
        );
      }

      doc.end();
    });
  },
};
