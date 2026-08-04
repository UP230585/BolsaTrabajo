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

// Clasificador semántico único: a partir de un texto de estado en español,
// decide qué color de marca le corresponde. Lo comparten el Excel y el PDF
// para que ambos reportes coloreen los mismos estados de la misma forma.
type Semaforo = "success" | "warning" | "danger" | "neutral";

function semaforoPorEstado(texto: string): Semaforo {
  const t = texto.toLowerCase();
  if (t.includes("activo") || t.includes("aprobad") || t.includes("contratado")) return "success";
  if (t.includes("pendiente") || t.includes("en contacto") || t.includes("entrevista")) return "warning";
  if (t.includes("desactivado") || t.includes("no seleccionado") || t.includes("pausada")) return "danger";
  return "neutral";
}

const ARGB_MARCA = {
  navy: "FF1F3864",
  navyOscuro: "FF16294D",
  orange: "FFE8722C",
  success: "FF2E7D32",
  warning: "FFF9A825",
  danger: "FFC62828",
  surface: "FFF2F2F2",
  white: "FFFFFFFF",
  gris: "FF666666",
  borde: "FFE0E0E0",
};

const ARGB_POR_SEMAFORO: Record<Semaforo, string> = {
  success: ARGB_MARCA.success,
  warning: ARGB_MARCA.warning,
  danger: ARGB_MARCA.danger,
  neutral: ARGB_MARCA.navy,
};

const HEX_MARCA = {
  navy: "#1f3864",
  navyOscuro: "#16294d",
  orange: "#e8722c",
  success: "#2e7d32",
  warning: "#f9a825",
  danger: "#c62828",
  texto: "#1a1a1a",
  gris: "#666666",
  grisClaro: "#999999",
  fondoZebra: "#f7f7f7",
  borde: "#e5e5e5",
};

const HEX_POR_SEMAFORO: Record<Semaforo, string> = {
  success: HEX_MARCA.success,
  warning: HEX_MARCA.warning,
  danger: HEX_MARCA.danger,
  neutral: HEX_MARCA.navy,
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

// ---------------------------------------------------------------------------
// Excel
// ---------------------------------------------------------------------------

const BORDE_FINO: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: ARGB_MARCA.borde } },
  left: { style: "thin", color: { argb: ARGB_MARCA.borde } },
  bottom: { style: "thin", color: { argb: ARGB_MARCA.borde } },
  right: { style: "thin", color: { argb: ARGB_MARCA.borde } },
};

interface ColumnaExcel {
  header: string;
  key: string;
  width: number;
  numFmt?: string;
  align?: "left" | "right" | "center";
}

// Banner de marca (fila 1) + subtítulo (fila 2) + encabezado de columnas (fila 3).
// Deja la hoja lista para recibir filas de datos desde la 4 en adelante con addRow().
function crearHojaConBanner(
  libro: ExcelJS.Workbook,
  nombre: string,
  columnas: ColumnaExcel[],
  totalRegistros: number
): ExcelJS.Worksheet {
  const hoja = libro.addWorksheet(nombre, { properties: { tabColor: { argb: ARGB_MARCA.navy } } });
  hoja.columns = columnas.map(({ key, width, numFmt }) => ({ key, width, ...(numFmt ? { style: { numFmt } } : {}) }));

  const numColumnas = columnas.length;

  hoja.mergeCells(1, 1, 1, numColumnas);
  const filaBanner = hoja.getRow(1);
  filaBanner.height = 28;
  filaBanner.getCell(1).value = "Bolsa de Trabajo UPA — Reporte administrativo";
  filaBanner.getCell(1).font = { bold: true, size: 14, color: { argb: ARGB_MARCA.white } };
  filaBanner.getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  filaBanner.eachCell({ includeEmpty: true }, (celda: ExcelJS.Cell) => {
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ARGB_MARCA.navy } };
  });

  hoja.mergeCells(2, 1, 2, numColumnas);
  const filaSubtitulo = hoja.getRow(2);
  filaSubtitulo.height = 18;
  filaSubtitulo.getCell(1).value =
    `Hoja "${nombre}" · generado el ${new Date().toLocaleString("es-MX")} · ${totalRegistros} registro(s)`;
  filaSubtitulo.getCell(1).font = { italic: true, size: 9, color: { argb: ARGB_MARCA.gris } };
  filaSubtitulo.getCell(1).alignment = { vertical: "middle", indent: 1 };
  filaSubtitulo.eachCell({ includeEmpty: true }, (celda: ExcelJS.Cell) => {
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ARGB_MARCA.surface } };
  });

  const filaEncabezado = hoja.getRow(3);
  filaEncabezado.height = 20;
  columnas.forEach((col, i) => {
    const celda = filaEncabezado.getCell(i + 1);
    celda.value = col.header;
    celda.font = { bold: true, color: { argb: ARGB_MARCA.white } };
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ARGB_MARCA.navyOscuro } };
    celda.alignment = { vertical: "middle", horizontal: col.align === "right" ? "right" : "left" };
    celda.border = BORDE_FINO;
  });

  hoja.views = [{ state: "frozen", ySplit: 3 }];
  hoja.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: numColumnas } };

  return hoja;
}

// Zebra striping + bordes + coloreado de la columna de estado (si aplica),
// una vez que ya se agregaron todas las filas de datos con addRow().
function darEstiloAFilas(hoja: ExcelJS.Worksheet, columnas: ColumnaExcel[], columnaEstado?: string) {
  const primeraFilaDatos = 4;
  hoja.eachRow((fila: ExcelJS.Row, numFila: number) => {
    if (numFila < primeraFilaDatos) return;
    const esPar = (numFila - primeraFilaDatos) % 2 === 1;
    columnas.forEach((col, i) => {
      const celda = fila.getCell(i + 1);
      celda.border = BORDE_FINO;
      celda.alignment = { vertical: "middle", horizontal: col.align === "right" ? "right" : "left" };
      if (esPar) {
        celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ARGB_MARCA.surface } };
      }
      if (columnaEstado && col.key === columnaEstado) {
        const semaforo = semaforoPorEstado(String(celda.value ?? ""));
        celda.font = { bold: true, color: { argb: ARGB_POR_SEMAFORO[semaforo] } };
      }
    });
  });
}

async function generarExcel(): Promise<ExcelJS.Buffer> {
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
  const hojaResumen = libro.addWorksheet("Resumen", { properties: { tabColor: { argb: ARGB_MARCA.orange } } });
  hojaResumen.columns = [
    { key: "etiqueta", width: 34 },
    { key: "valor", width: 20 },
  ];

  hojaResumen.mergeCells(1, 1, 1, 2);
  hojaResumen.getRow(1).height = 30;
  hojaResumen.getCell("A1").value = "Bolsa de Trabajo UPA — Reporte administrativo";
  hojaResumen.getCell("A1").font = { bold: true, size: 16, color: { argb: ARGB_MARCA.white } };
  hojaResumen.getCell("A1").alignment = { vertical: "middle", indent: 1 };
  hojaResumen.getRow(1).eachCell({ includeEmpty: true }, (c: ExcelJS.Cell) => {
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ARGB_MARCA.navy } };
  });

  hojaResumen.mergeCells(2, 1, 2, 2);
  hojaResumen.getRow(2).height = 18;
  hojaResumen.getCell("A2").value = `Generado el ${new Date().toLocaleString("es-MX")}`;
  hojaResumen.getCell("A2").font = { italic: true, size: 9, color: { argb: ARGB_MARCA.gris } };
  hojaResumen.getCell("A2").alignment = { vertical: "middle", indent: 1 };
  hojaResumen.getRow(2).eachCell({ includeEmpty: true }, (c: ExcelJS.Cell) => {
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ARGB_MARCA.surface } };
  });

  function tituloBloque(texto: string) {
    const fila = hojaResumen.addRow({ etiqueta: texto });
    hojaResumen.mergeCells(fila.number, 1, fila.number, 2);
    fila.getCell(1).font = { bold: true, size: 12, color: { argb: ARGB_MARCA.navy } };
    fila.getCell(1).border = { bottom: { style: "medium", color: { argb: ARGB_MARCA.orange } } };
  }

  hojaResumen.addRow({});
  tituloBloque("Métricas generales");
  for (const { clave, etiqueta } of ETIQUETAS_METRICAS) {
    const fila = hojaResumen.addRow({ etiqueta, valor: (metricas as Record<string, number>)[clave] });
    fila.getCell(1).font = { color: { argb: ARGB_MARCA.gris } };
    fila.getCell(2).font = { bold: true, size: 12, color: { argb: ARGB_MARCA.navy } };
    fila.getCell(1).border = BORDE_FINO;
    fila.getCell(2).border = BORDE_FINO;
  }

  hojaResumen.addRow({});
  tituloBloque("Estudiantes por carrera");
  const filaSubEncCarreras = hojaResumen.addRow({ etiqueta: "Carrera", valor: "Estudiantes / Vacantes" });
  filaSubEncCarreras.font = { bold: true, color: { argb: ARGB_MARCA.white } };
  filaSubEncCarreras.eachCell((c: ExcelJS.Cell) => {
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ARGB_MARCA.navyOscuro } };
    c.border = BORDE_FINO;
  });
  filasCarreras.forEach((c, i) => {
    const fila = hojaResumen.addRow({ etiqueta: `${c.carrera} (${c.clave})`, valor: `${c.estudiantes} / ${c.vacantes}` });
    if (i % 2 === 1) {
      fila.eachCell(
        (celda: ExcelJS.Cell) => (celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ARGB_MARCA.surface } })
      );
    }
    fila.eachCell((celda: ExcelJS.Cell) => (celda.border = BORDE_FINO));
  });

  hojaResumen.addRow({});
  tituloBloque("Postulaciones por estatus");
  filasEstatus.forEach((e, i) => {
    const fila = hojaResumen.addRow({ etiqueta: e.estatus, valor: e.total });
    fila.getCell(1).font = { bold: true, color: { argb: ARGB_POR_SEMAFORO[semaforoPorEstado(e.estatus)] } };
    if (i % 2 === 1) {
      fila.eachCell(
        (celda: ExcelJS.Cell) => (celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ARGB_MARCA.surface } })
      );
    }
    fila.eachCell((celda: ExcelJS.Cell) => (celda.border = BORDE_FINO));
  });

  // --- Usuarios ---
  const columnasUsuarios: ColumnaExcel[] = [
    { header: "Nombre / Razón social", key: "nombre", width: 32 },
    { header: "Correo", key: "correo", width: 32 },
    { header: "Rol", key: "rol", width: 14 },
    { header: "Detalle", key: "detalle", width: 34 },
    { header: "Estado", key: "estado", width: 16 },
    { header: "Registrado", key: "creadoEn", width: 16 },
  ];
  const hojaUsuarios = crearHojaConBanner(libro, "Usuarios", columnasUsuarios, filasUsuarios.length);
  for (const fila of filasUsuarios) {
    hojaUsuarios.addRow({ ...fila, creadoEn: new Date(fila.creadoEn).toLocaleDateString("es-MX") });
  }
  darEstiloAFilas(hojaUsuarios, columnasUsuarios, "estado");

  // --- Vacantes ---
  const columnasVacantes: ColumnaExcel[] = [
    { header: "Título", key: "titulo", width: 30 },
    { header: "Empresa", key: "empresa", width: 28 },
    { header: "Carrera", key: "carrera", width: 12 },
    { header: "Modalidad", key: "modalidad", width: 14 },
    { header: "Cuatrimestre mín.", key: "cuatrimestreMin", width: 16, align: "right" },
    { header: "Salario", key: "salario", width: 14, numFmt: '"$"#,##0', align: "right" },
    { header: "Estado", key: "estado", width: 22 },
    { header: "Postulaciones", key: "postulaciones", width: 14, align: "right" },
    { header: "Publicada", key: "creadaEn", width: 16 },
  ];
  const hojaVacantes = crearHojaConBanner(libro, "Vacantes", columnasVacantes, filasVacantes.length);
  for (const fila of filasVacantes) {
    hojaVacantes.addRow({ ...fila, salario: fila.salario ?? undefined, creadaEn: new Date(fila.creadaEn).toLocaleDateString("es-MX") });
  }
  darEstiloAFilas(hojaVacantes, columnasVacantes, "estado");

  // --- Postulaciones ---
  const columnasPostulaciones: ColumnaExcel[] = [
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
  const hojaPostulaciones = crearHojaConBanner(libro, "Postulaciones", columnasPostulaciones, filasPostulaciones.length);
  for (const fila of filasPostulaciones) {
    hojaPostulaciones.addRow({
      ...fila,
      creadaEn: new Date(fila.creadaEn).toLocaleDateString("es-MX"),
      actualizadaEn: new Date(fila.actualizadaEn).toLocaleDateString("es-MX"),
    });
  }
  darEstiloAFilas(hojaPostulaciones, columnasPostulaciones, "estatus");

  // --- Empresas ---
  const columnasEmpresas: ColumnaExcel[] = [
    { header: "Razón social", key: "razonSocial", width: 30 },
    { header: "RFC", key: "rfc", width: 16 },
    { header: "Giro", key: "giro", width: 22 },
    { header: "Correo", key: "correo", width: 30 },
    { header: "Estado", key: "estado", width: 22 },
    { header: "Vacantes publicadas", key: "vacantesPublicadas", width: 18, align: "right" },
  ];
  const hojaEmpresas = crearHojaConBanner(libro, "Empresas", columnasEmpresas, filasEmpresas.length);
  for (const fila of filasEmpresas) {
    hojaEmpresas.addRow(fila);
  }
  darEstiloAFilas(hojaEmpresas, columnasEmpresas, "estado");

  return libro.xlsx.writeBuffer();
}

// ---------------------------------------------------------------------------
// PDF
// ---------------------------------------------------------------------------

type PDFDoc = InstanceType<typeof PDFDocument>;

interface ColumnaPdf {
  header: string;
  key: string;
  width: number;
  align?: "left" | "right" | "center";
}

function anchoUtil(doc: PDFDoc): number {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

function xDeColumna(doc: PDFDoc, columnas: ColumnaPdf[], indice: number): number {
  const offset = columnas.slice(0, indice).reduce((acc, c) => acc + c.width, 0);
  return doc.page.margins.left + offset;
}

function tituloSeccionPdf(doc: PDFDoc, texto: string, contador?: number) {
  if (doc.y > doc.page.height - doc.page.margins.bottom - 90) {
    doc.addPage();
  }
  doc.moveDown(1);
  const y = doc.y;
  doc.rect(doc.page.margins.left, y, 3, 16).fill(HEX_MARCA.orange);
  doc
    .fillColor(HEX_MARCA.navy)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(contador !== undefined ? `${texto} (${contador})` : texto, doc.page.margins.left + 10, y - 1);
  doc.moveDown(0.5);
  doc.font("Helvetica").fillColor(HEX_MARCA.texto).fontSize(9);
}

function dibujarTablaPdf<T extends Record<string, unknown>>(
  doc: PDFDoc,
  columnas: ColumnaPdf[],
  filas: T[],
  opts?: { columnaColoreada?: string }
) {
  const alturaEncabezado = 20;
  const padding = 4;

  function dibujarEncabezado() {
    const y = doc.y;
    doc.rect(doc.page.margins.left, y, anchoUtil(doc), alturaEncabezado).fill(HEX_MARCA.navyOscuro);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8);
    columnas.forEach((col, i) => {
      doc.text(col.header, xDeColumna(doc, columnas, i) + padding, y + 6, {
        width: col.width - padding * 2,
        align: col.align ?? "left",
      });
    });
    doc.y = y + alturaEncabezado;
    doc.font("Helvetica").fillColor(HEX_MARCA.texto).fontSize(8);
  }

  dibujarEncabezado();

  filas.forEach((fila, indice) => {
    doc.font("Helvetica").fontSize(8);
    const alturas = columnas.map((col) =>
      doc.heightOfString(String(fila[col.key] ?? "—"), { width: col.width - padding * 2 })
    );
    const alturaFila = Math.max(14, ...alturas) + 6;

    if (doc.y + alturaFila > doc.page.height - doc.page.margins.bottom - 30) {
      doc.addPage();
      doc.y = doc.page.margins.top;
      dibujarEncabezado();
    }

    const y = doc.y;
    if (indice % 2 === 1) {
      doc.rect(doc.page.margins.left, y, anchoUtil(doc), alturaFila).fill(HEX_MARCA.fondoZebra);
    }

    columnas.forEach((col, i) => {
      const valor = String(fila[col.key] ?? "—");
      const esColoreada = opts?.columnaColoreada === col.key;
      const color = esColoreada ? HEX_POR_SEMAFORO[semaforoPorEstado(valor)] : HEX_MARCA.texto;
      doc
        .fillColor(color)
        .font(esColoreada ? "Helvetica-Bold" : "Helvetica")
        .fontSize(8)
        .text(valor, xDeColumna(doc, columnas, i) + padding, y + 4, {
          width: col.width - padding * 2,
          align: col.align ?? "left",
        });
    });

    doc.y = y + alturaFila;
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.margins.left + anchoUtil(doc), doc.y)
      .strokeColor(HEX_MARCA.borde)
      .lineWidth(0.5)
      .stroke();
  });

  doc.font("Helvetica").fillColor(HEX_MARCA.texto).fontSize(9);
  doc.moveDown(1);
}

function dibujarTarjetasMetricas(doc: PDFDoc, metricas: { etiqueta: string; valor: string | number }[]) {
  const columnas = 3;
  const gap = 10;
  const anchoTarjeta = (anchoUtil(doc) - gap * (columnas - 1)) / columnas;
  const altoTarjeta = 52;
  const yInicial = doc.y;

  metricas.forEach((m, i) => {
    const col = i % columnas;
    const fila = Math.floor(i / columnas);
    const x = doc.page.margins.left + col * (anchoTarjeta + gap);
    const y = yInicial + fila * (altoTarjeta + gap);

    doc.roundedRect(x, y, anchoTarjeta, altoTarjeta, 4).fillAndStroke(HEX_MARCA.fondoZebra, HEX_MARCA.borde);
    doc.rect(x, y, 3, altoTarjeta).fill(HEX_MARCA.orange);
    doc
      .fillColor(HEX_MARCA.navy)
      .font("Helvetica-Bold")
      .fontSize(16)
      .text(String(m.valor), x + 12, y + 10, { width: anchoTarjeta - 20 });
    doc
      .fillColor(HEX_MARCA.gris)
      .font("Helvetica")
      .fontSize(8)
      .text(m.etiqueta, x + 12, y + 30, { width: anchoTarjeta - 20 });
  });

  const filas = Math.ceil(metricas.length / columnas);
  doc.y = yInicial + filas * (altoTarjeta + gap);
  doc.font("Helvetica").fillColor(HEX_MARCA.texto).fontSize(9);
}

async function generarPdf(): Promise<Buffer> {
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
    const doc = new PDFDocument({
      margin: 40,
      bufferPages: true,
      info: { Title: "Reporte — Bolsa de Trabajo UPA", Author: "Bolsa de Trabajo UPA" },
    });
    const trozos: Buffer[] = [];
    doc.on("data", (trozo: Buffer) => trozos.push(trozo));
    doc.on("end", () => resolve(Buffer.concat(trozos)));
    doc.on("error", reject);

    // --- Portada / banner de marca ---
    const altoBanner = 74;
    doc.rect(0, 0, doc.page.width, altoBanner).fill(HEX_MARCA.navy);
    doc.rect(0, altoBanner, doc.page.width, 4).fill(HEX_MARCA.orange);
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("Bolsa de Trabajo UPA", doc.page.margins.left, 22);
    doc
      .fillColor("#ffffff")
      .font("Helvetica")
      .fontSize(10)
      .opacity(0.85)
      .text("Reporte administrativo · Coordinación de Vinculación", doc.page.margins.left, 48)
      .opacity(1);
    doc
      .fillColor("#ffffff")
      .font("Helvetica")
      .fontSize(9)
      .opacity(0.7)
      .text(new Date().toLocaleString("es-MX"), doc.page.margins.left, 48, {
        width: anchoUtil(doc),
        align: "right",
      })
      .opacity(1);

    doc.y = altoBanner + 24;
    doc.font("Helvetica").fillColor(HEX_MARCA.texto).fontSize(9);

    tituloSeccionPdf(doc, "Resumen ejecutivo");
    dibujarTarjetasMetricas(
      doc,
      ETIQUETAS_METRICAS.map(({ clave, etiqueta }) => ({
        etiqueta,
        valor: (metricas as Record<string, number>)[clave] ?? 0,
      }))
    );

    tituloSeccionPdf(doc, "Estudiantes por carrera");
    dibujarTablaPdf(
      doc,
      [
        { header: "Carrera", key: "carrera", width: 260 },
        { header: "Clave", key: "clave", width: 70 },
        { header: "Estudiantes", key: "estudiantes", width: 100, align: "right" },
        { header: "Vacantes", key: "vacantes", width: 102, align: "right" },
      ],
      filasCarreras
    );

    tituloSeccionPdf(doc, "Postulaciones por estatus");
    dibujarTablaPdf(
      doc,
      [
        { header: "Estatus", key: "estatus", width: 380 },
        { header: "Total", key: "total", width: 152, align: "right" },
      ],
      filasEstatus,
      { columnaColoreada: "estatus" }
    );

    tituloSeccionPdf(doc, "Empresas registradas", filasEmpresas.length);
    dibujarTablaPdf(
      doc,
      [
        { header: "Razón social", key: "razonSocial", width: 140 },
        { header: "RFC", key: "rfc", width: 70 },
        { header: "Giro", key: "giro", width: 90 },
        { header: "Correo", key: "correo", width: 110 },
        { header: "Estado", key: "estado", width: 62 },
        { header: "Vacantes", key: "vacantesPublicadas", width: 60, align: "right" },
      ],
      filasEmpresas,
      { columnaColoreada: "estado" }
    );

    tituloSeccionPdf(doc, "Vacantes publicadas", filasVacantes.length);
    dibujarTablaPdf(
      doc,
      [
        { header: "Título", key: "titulo", width: 110 },
        { header: "Empresa", key: "empresa", width: 90 },
        { header: "Carrera", key: "carrera", width: 50 },
        { header: "Modalidad", key: "modalidad", width: 60 },
        { header: "Cuatri.", key: "cuatrimestreMin", width: 40, align: "right" },
        { header: "Salario", key: "salarioTexto", width: 60, align: "right" },
        { header: "Estado", key: "estado", width: 72 },
        { header: "Postul.", key: "postulaciones", width: 50, align: "right" },
      ],
      filasVacantes.map((v) => ({
        ...v,
        salarioTexto: v.salario ? `$${v.salario.toLocaleString("es-MX")}` : "N/E",
      })),
      { columnaColoreada: "estado" }
    );

    tituloSeccionPdf(doc, "Postulaciones", filasPostulaciones.length);
    dibujarTablaPdf(
      doc,
      [
        { header: "Estudiante", key: "estudiante", width: 100 },
        { header: "Matrícula", key: "matricula", width: 60 },
        { header: "Carrera", key: "carrera", width: 45 },
        { header: "Vacante", key: "vacante", width: 90 },
        { header: "Empresa", key: "empresa", width: 80 },
        { header: "Estatus", key: "estatus", width: 75 },
        { header: "Postulado", key: "creadaEnTexto", width: 82, align: "right" },
      ],
      filasPostulaciones.map((p) => ({
        ...p,
        creadaEnTexto: new Date(p.creadaEn).toLocaleDateString("es-MX"),
      })),
      { columnaColoreada: "estatus" }
    );

    tituloSeccionPdf(doc, "Usuarios registrados", filasUsuarios.length);
    dibujarTablaPdf(
      doc,
      [
        { header: "Nombre / Razón social", key: "nombre", width: 110 },
        { header: "Correo", key: "correo", width: 140 },
        { header: "Rol", key: "rol", width: 78 },
        { header: "Detalle", key: "detalle", width: 142 },
        { header: "Estado", key: "estado", width: 62 },
      ],
      filasUsuarios,
      { columnaColoreada: "estado" }
    );

    // Numeración de páginas al final, ya con el total de páginas conocido.
    // Se pone el margen inferior en 0 mientras se escribe: si no, PDFKit
    // interpreta el texto pegado al borde como un desbordamiento y agrega
    // una página en blanco extra por cada footer que intenta dibujar.
    const rango = doc.bufferedPageRange();
    const margenInferiorOriginal = doc.page.margins.bottom;
    for (let i = 0; i < rango.count; i++) {
      doc.switchToPage(i);
      doc.page.margins.bottom = 0;
      doc
        .fontSize(8)
        .fillColor(HEX_MARCA.grisClaro)
        .text(`Bolsa de Trabajo UPA · Página ${i + 1} de ${rango.count}`, 40, doc.page.height - 30, {
          align: "center",
          width: doc.page.width - 80,
          lineBreak: false,
        });
      doc.page.margins.bottom = margenInferiorOriginal;
    }

    doc.end();
  });
}

export const reporteService = {
  generarExcel,
  generarPdf,
};
