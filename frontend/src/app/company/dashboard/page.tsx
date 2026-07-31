"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { misVacantesRequest, cambiarEstadoVacanteRequest } from "@/services/jobs.service";
import { postulacionesDeMiEmpresaRequest, actualizarEstatusRequest } from "@/services/applications.service";
import type { Vacante } from "@/types/jobs";
import type { Postulacion, EstatusPostulacion } from "@/types/applications";
import { COLUMNAS_KANBAN } from "@/types/applications";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
// Mismo criterio que en student/profile: el archivo puede venir como URL
// absoluta (Azure Blob Storage) o como ruta relativa servida por el backend.
const SERVIDOR_ARCHIVOS = API_BASE.replace(/\/api\/v1\/?$/, "");

function urlCompletaDelCv(archivoUrl: string): string {
  return archivoUrl.startsWith("http") ? archivoUrl : `${SERVIDOR_ARCHIVOS}${archivoUrl}`;
}

export default function CompanyDashboardPage() {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);

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

  async function handleTogglePausa(vacante: Vacante) {
    setCambiandoEstado(vacante.id);
    try {
      const actualizada = await cambiarEstadoVacanteRequest(vacante.id, !vacante.activa);
      setVacantes((prev) => prev.map((v) => (v.id === vacante.id ? { ...v, activa: actualizada.activa } : v)));
    } finally {
      setCambiandoEstado(null);
    }
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
        <div className="flex gap-3">
          <Link
            href="/chat"
            className="rounded-md border border-navy px-5 py-2.5 font-medium text-navy hover:bg-surface transition-colors"
          >
            Mensajes
          </Link>
          <Link
            href="/company/jobs/new"
            className="rounded-md bg-orange px-5 py-2.5 font-medium text-white hover:opacity-90 transition-opacity"
          >
            Publicar vacante
          </Link>
        </div>
      </div>

      <h2 className="font-semibold text-navy mb-3">Mis vacantes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {vacantes.length === 0 && <p className="text-black/60">Aún no has publicado vacantes.</p>}
        {vacantes.map((v) => (
          <div key={v.id} className="rounded-lg border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-navy">{v.titulo}</h3>
              <div className="flex gap-1.5 flex-wrap justify-end">
                <span
                  className={`text-xs rounded-full px-2 py-1 whitespace-nowrap ${
                    v.aprobada ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  }`}
                >
                  {v.aprobada ? "Aprobada" : "Pendiente de aprobación"}
                </span>
                {!v.activa && (
                  <span className="text-xs rounded-full px-2 py-1 whitespace-nowrap bg-black/10 text-black/60">
                    Pausada
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-black/60 mt-1">{v._count?.postulaciones ?? 0} postulación(es)</p>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/company/jobs/edit?id=${v.id}`}
                className="rounded-md border border-navy px-3 py-1.5 text-sm font-medium text-navy hover:bg-surface transition-colors"
              >
                Editar
              </Link>
              <button
                onClick={() => handleTogglePausa(v)}
                disabled={cambiandoEstado === v.id}
                className="rounded-md border border-black/20 px-3 py-1.5 text-sm font-medium text-black/70 hover:bg-surface transition-colors disabled:opacity-50"
              >
                {cambiandoEstado === v.id ? "..." : v.activa ? "Pausar" : "Activar"}
              </button>
            </div>
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
                <th className="px-4 py-2">Estudiante</th>
                <th className="px-4 py-2">Vacante</th>
                <th className="px-4 py-2">CV</th>
                <th className="px-4 py-2">Estatus</th>
                <th className="px-4 py-2">Actualizar</th>
              </tr>
            </thead>
            <tbody>
              {postulaciones.map((p) => (
                <tr key={p.id} className="border-t border-black/5">
                  <td className="px-4 py-2">
                    {p.estudiante ? (
                      <>
                        <p className="font-medium text-navy">
                          {p.estudiante.nombreCompleto ?? p.estudiante.matricula}
                        </p>
                        <p className="text-xs text-black/50">
                          {p.estudiante.matricula} · {p.estudiante.carrera.clave} · {p.estudiante.usuario.correo}
                        </p>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2">{p.vacante.titulo}</td>
                  <td className="px-4 py-2">
                    {p.estudiante?.cv ? (
                      <a
                        href={urlCompletaDelCv(p.estudiante.cv.archivoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange font-medium hover:underline"
                      >
                        Ver CV ({p.estudiante.cv.porcentaje}%)
                      </a>
                    ) : (
                      <span className="text-black/40">Sin CV</span>
                    )}
                  </td>
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
