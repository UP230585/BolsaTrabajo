"use client";

import { useEffect, useState } from "react";
import {
  empresasPendientesRequest,
  aprobarEmpresaRequest,
  vacantesPendientesRequest,
  aprobarVacanteRequest,
  metricasRequest,
  listarUsuariosRequest,
  cambiarEstadoUsuarioRequest,
  descargarReporteExcelRequest,
  descargarReportePdfRequest,
} from "@/services/admin.service";
import type { EmpresaPendiente, VacantePendiente, Metricas, UsuarioAdmin } from "@/types/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { PageLoading, EmptyState } from "@/components/ui/PageState";

export default function AdminPage() {
  const [empresas, setEmpresas] = useState<EmpresaPendiente[]>([]);
  const [vacantes, setVacantes] = useState<VacantePendiente[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [filtroRol, setFiltroRol] = useState<"" | "ESTUDIANTE" | "EMPRESA">("");
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState<"excel" | "pdf" | null>(null);

  useEffect(() => {
    Promise.all([
      empresasPendientesRequest(),
      vacantesPendientesRequest(),
      metricasRequest(),
      listarUsuariosRequest(),
    ])
      .then(([e, v, m, u]) => {
        setEmpresas(e);
        setVacantes(v);
        setMetricas(m);
        setUsuarios(u);
      })
      .finally(() => setCargando(false));
  }, []);

  async function handleEstadoUsuario(id: number, activo: boolean) {
    const actualizado = await cambiarEstadoUsuarioRequest(id, activo);
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, activo: actualizado.activo } : u)));
  }

  async function handleEmpresa(id: number, aprobada: boolean) {
    await aprobarEmpresaRequest(id, aprobada);
    setEmpresas((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleVacante(id: number, aprobada: boolean) {
    await aprobarVacanteRequest(id, aprobada);
    setVacantes((prev) => prev.filter((v) => v.id !== id));
  }

  async function handleExportar(formato: "excel" | "pdf") {
    setExportando(formato);
    try {
      await (formato === "excel" ? descargarReporteExcelRequest() : descargarReportePdfRequest());
    } finally {
      setExportando(null);
    }
  }

  if (cargando) {
    return <PageLoading label="Cargando panel de administración..." />;
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-navy">Panel de Coordinación</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="md" onClick={() => handleExportar("excel")} disabled={exportando !== null}>
            {exportando === "excel" ? "Generando..." : "Exportar Excel"}
          </Button>
          <Button variant="outline" size="md" onClick={() => handleExportar("pdf")} disabled={exportando !== null}>
            {exportando === "pdf" ? "Generando..." : "Exportar PDF"}
          </Button>
        </div>
      </div>

      {metricas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Estudiantes registrados", valor: metricas.totalEstudiantes },
            { label: "% con CV completo", valor: `${metricas.porcentajeCvCompleto}%` },
            { label: "Empresas activas", valor: metricas.empresasActivas },
            { label: "Vacantes este mes", valor: metricas.vacantesPublicadasEsteMes },
            { label: "Postulaciones totales", valor: metricas.totalPostulaciones },
            { label: "Contratados", valor: metricas.postulacionesContratadas },
            { label: "Tasa de éxito", valor: `${metricas.tasaDeExito}%` },
          ].map((stat) => (
            <Card key={stat.label} className="p-4 text-center">
              <p className="text-2xl font-bold text-navy">{stat.valor}</p>
              <p className="text-xs text-black/60 mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>
      )}

      <h2 className="font-semibold text-navy mb-3">Empresas pendientes de aprobación</h2>
      {empresas.length === 0 ? (
        <EmptyState>No hay empresas pendientes.</EmptyState>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white shadow-sm divide-y divide-black/5 mb-10">
          {empresas.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-navy">{e.razonSocial}</p>
                <p className="text-xs text-black/60">
                  {e.rfc} · {e.giro} · {e.usuario.correo}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={() => handleEmpresa(e.id, true)}>
                  Aprobar
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleEmpresa(e.id, false)}>
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-semibold text-navy mb-3">Vacantes pendientes de aprobación</h2>
      {vacantes.length === 0 ? (
        <EmptyState>No hay vacantes pendientes.</EmptyState>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white shadow-sm divide-y divide-black/5 mb-10">
          {vacantes.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-navy">{v.titulo}</p>
                <p className="text-xs text-black/60">
                  {v.empresa.razonSocial} · {v.carrera.nombre}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={() => handleVacante(v.id, true)}>
                  Aprobar
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleVacante(v.id, false)}>
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-navy">Usuarios registrados</h2>
        <Select
          size="sm"
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value as "" | "ESTUDIANTE" | "EMPRESA")}
        >
          <option value="">Todos los roles</option>
          <option value="ESTUDIANTE">Estudiantes</option>
          <option value="EMPRESA">Empresas</option>
        </Select>
      </div>
      {usuarios.filter((u) => !filtroRol || u.rol === filtroRol).length === 0 ? (
        <EmptyState>No hay usuarios que coincidan con ese filtro.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left">
              <tr>
                <th className="px-4 py-2">Correo</th>
                <th className="px-4 py-2">Rol</th>
                <th className="px-4 py-2">Detalle</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {usuarios
                .filter((u) => !filtroRol || u.rol === filtroRol)
                .map((u) => (
                  <tr key={u.id} className="border-t border-black/5">
                    <td className="px-4 py-2">{u.correo}</td>
                    <td className="px-4 py-2">{u.rol}</td>
                    <td className="px-4 py-2 text-black/60">
                      {u.estudiante
                        ? `${u.estudiante.nombreCompleto ?? u.estudiante.matricula} · ${u.estudiante.matricula} · ${u.estudiante.carrera.clave}`
                        : u.empresa
                          ? u.empresa.razonSocial
                          : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <Badge tone={u.activo ? "success" : "danger"}>{u.activo ? "Activo" : "Desactivado"}</Badge>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEstadoUsuario(u.id, !u.activo)}
                        className="text-xs font-medium text-orange hover:underline"
                      >
                        {u.activo ? "Desactivar" : "Reactivar"}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
