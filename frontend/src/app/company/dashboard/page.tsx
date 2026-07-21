"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { misVacantesRequest } from "@/services/jobs.service";
import { postulacionesDeMiEmpresaRequest, actualizarEstatusRequest } from "@/services/applications.service";
import type { Vacante } from "@/types/jobs";
import type { Postulacion, EstatusPostulacion } from "@/types/applications";
import { COLUMNAS_KANBAN } from "@/types/applications";

export default function CompanyDashboardPage() {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([misVacantesRequest(), postulacionesDeMiEmpresaRequest()])
      .then(([v, p]) => {
        setVacantes(v);
        setPostulaciones(p);
      })
      .finally(() => setCargando(false));
  }, []);

  async function handleCambiarEstatus(id: number, estatus: EstatusPostulacion) {
    const actualizado = await actualizarEstatusRequest(id, estatus);
    setPostulaciones((prev) => prev.map((p) => (p.id === id ? { ...p, estatus: actualizado.estatus } : p)));
  }

  if (cargando) {
    return <p className="text-center py-16 text-black/60">Cargando tu dashboard...</p>;
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Dashboard de empresa</h1>
          <p className="text-black/60">
            {vacantes.length} vacante(s) · {postulaciones.length} postulación(es) recibida(s)
          </p>
        </div>
        <Link
          href="/company/jobs/new"
          className="rounded-md bg-orange px-5 py-2.5 font-medium text-white hover:opacity-90 transition-opacity"
        >
          Publicar vacante
        </Link>
      </div>

      <h2 className="font-semibold text-navy mb-3">Mis vacantes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {vacantes.length === 0 && <p className="text-black/60">Aún no has publicado vacantes.</p>}
        {vacantes.map((v) => (
          <div key={v.id} className="rounded-lg border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-navy">{v.titulo}</h3>
              <span
                className={`text-xs rounded-full px-2 py-1 ${
                  v.aprobada ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}
              >
                {v.aprobada ? "Aprobada" : "Pendiente de aprobación"}
              </span>
            </div>
            <p className="text-sm text-black/60 mt-1">{v._count?.postulaciones ?? 0} postulación(es)</p>
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-navy mb-3">Candidatos</h2>
      {postulaciones.length === 0 ? (
        <p className="text-black/60">Todavía no han recibido postulaciones.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left">
              <tr>
                <th className="px-4 py-2">Vacante</th>
                <th className="px-4 py-2">Estatus</th>
                <th className="px-4 py-2">Actualizar</th>
              </tr>
            </thead>
            <tbody>
              {postulaciones.map((p) => (
                <tr key={p.id} className="border-t border-black/5">
                  <td className="px-4 py-2">{p.vacante.titulo}</td>
                  <td className="px-4 py-2">{p.estatus}</td>
                  <td className="px-4 py-2">
                    <select
                      value={p.estatus}
                      onChange={(e) => handleCambiarEstatus(p.id, e.target.value as EstatusPostulacion)}
                      className="rounded-md border border-black/20 px-2 py-1 text-xs"
                    >
                      {COLUMNAS_KANBAN.map((c) => (
                        <option key={c.estatus} value={c.estatus}>
                          {c.titulo}
                        </option>
                      ))}
                    </select>
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
