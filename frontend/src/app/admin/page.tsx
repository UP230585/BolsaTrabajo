"use client";

import { useEffect, useState } from "react";
import {
  empresasPendientesRequest,
  aprobarEmpresaRequest,
  vacantesPendientesRequest,
  aprobarVacanteRequest,
  metricasRequest,
} from "@/services/admin.service";
import type { EmpresaPendiente, VacantePendiente, Metricas } from "@/types/admin";

export default function AdminPage() {
  const [empresas, setEmpresas] = useState<EmpresaPendiente[]>([]);
  const [vacantes, setVacantes] = useState<VacantePendiente[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([empresasPendientesRequest(), vacantesPendientesRequest(), metricasRequest()])
      .then(([e, v, m]) => {
        setEmpresas(e);
        setVacantes(v);
        setMetricas(m);
      })
      .finally(() => setCargando(false));
  }, []);

  async function handleEmpresa(id: number, aprobada: boolean) {
    await aprobarEmpresaRequest(id, aprobada);
    setEmpresas((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleVacante(id: number, aprobada: boolean) {
    await aprobarVacanteRequest(id, aprobada);
    setVacantes((prev) => prev.filter((v) => v.id !== id));
  }

  if (cargando) {
    return <p className="text-center py-16 text-black/60">Cargando panel de administración...</p>;
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy mb-8">Panel de Coordinación</h1>

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
            <div key={stat.label} className="rounded-lg border border-black/10 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-navy">{stat.valor}</p>
              <p className="text-xs text-black/60 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-semibold text-navy mb-3">Empresas pendientes de aprobación</h2>
      {empresas.length === 0 ? (
        <p className="text-black/60 mb-10">No hay empresas pendientes.</p>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white divide-y divide-black/5 mb-10">
          {empresas.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-navy">{e.razonSocial}</p>
                <p className="text-xs text-black/60">
                  {e.rfc} · {e.giro} · {e.usuario.correo}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEmpresa(e.id, true)}
                  className="rounded-md bg-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleEmpresa(e.id, false)}
                  className="rounded-md bg-danger px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-semibold text-navy mb-3">Vacantes pendientes de aprobación</h2>
      {vacantes.length === 0 ? (
        <p className="text-black/60">No hay vacantes pendientes.</p>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white divide-y divide-black/5">
          {vacantes.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-navy">{v.titulo}</p>
                <p className="text-xs text-black/60">
                  {v.empresa.razonSocial} · {v.carrera.nombre}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVacante(v.id, true)}
                  className="rounded-md bg-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleVacante(v.id, false)}
                  className="rounded-md bg-danger px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
