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

async function obtenerDatosDelReporte() {
  const [metricas, usuarios] = await Promise.all([
    adminRepository.metricas(),
    adminRepository.listarUsuarios(),
  ]);

  const filasUsuarios = usuarios.map((u) => ({
    correo: u.correo,
    rol: u.rol,
    detalle: u.estudiante
      ? `${u.estudiante.matricula} · ${u.estudiante.carrera.clave}`
      : u.empresa
        ? u.empresa.razonSocial
        : "—",
    estado: u.activo ? "Activo" : "Desactivado",
    creadoEn: u.creadoEn,
  }));

  return { metricas, filasUsuarios };
}

export const reporteService = {
  async generarExcel(): Promise<ExcelJS.Buffer> {
    const { metricas, filasUsuarios } = await obtenerDatosDelReporte();

    const libro = new ExcelJS.Workbook();
    libro.creator = "Bolsa de Trabajo UPA";
    libro.created = new Date();

    const hojaMetricas = libro.addWorksheet("Métricas");
    hojaMetricas.columns = [
      { header: "Indicador", key: "etiqueta", width: 30 },
      { header: "Valor", key: "valor", width: 15 },
    ];
    hojaMetricas.getRow(1).font = { bold: true };
    for (const { clave, etiqueta } of ETIQUETAS_METRICAS) {
      hojaMetricas.addRow({ etiqueta, valor: (metricas as Record<string, number>)[clave] });
    }

    const hojaUsuarios = libro.addWorksheet("Usuarios");
    hojaUsuarios.columns = [
      { header: "Correo", key: "correo", width: 32 },
      { header: "Rol", key: "rol", width: 14 },
      { header: "Detalle", key: "detalle", width: 30 },
      { header: "Estado", key: "estado", width: 14 },
      { header: "Registrado", key: "creadoEn", width: 18 },
    ];
    hojaUsuarios.getRow(1).font = { bold: true };
    for (const fila of filasUsuarios) {
      hojaUsuarios.addRow({ ...fila, creadoEn: new Date(fila.creadoEn).toLocaleDateString("es-MX") });
    }

    return libro.xlsx.writeBuffer();
  },

  async generarPdf(): Promise<Buffer> {
    const { metricas, filasUsuarios } = await obtenerDatosDelReporte();

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const trozos: Buffer[] = [];
      doc.on("data", (trozo) => trozos.push(trozo));
      doc.on("end", () => resolve(Buffer.concat(trozos)));
      doc.on("error", reject);

      doc.fontSize(18).text("Reporte — Bolsa de Trabajo UPA", { align: "center" });
      doc.fontSize(10).fillColor("#666666").text(new Date().toLocaleString("es-MX"), { align: "center" });
      doc.moveDown(1.5);

      doc.fillColor("#000000").fontSize(14).text("Métricas generales");
      doc.moveDown(0.5);
      for (const { clave, etiqueta } of ETIQUETAS_METRICAS) {
        const valor = (metricas as Record<string, number>)[clave];
        doc.fontSize(11).text(`${etiqueta}: ${valor}`);
      }

      doc.moveDown(1.5);
      doc.fontSize(14).text("Usuarios registrados");
      doc.moveDown(0.5);
      doc.fontSize(9);
      for (const fila of filasUsuarios) {
        doc.text(`${fila.correo}  ·  ${fila.rol}  ·  ${fila.detalle}  ·  ${fila.estado}`);
      }

      doc.end();
    });
  },
};
