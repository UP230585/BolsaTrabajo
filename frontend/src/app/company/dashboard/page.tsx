"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { misVacantesRequest, cambiarEstadoVacanteRequest } from "@/services/jobs.service";
import { postulacionesDeMiEmpresaRequest, actualizarEstatusRequest } from "@/services/applications.service";
import type { Vacante } from "@/types/jobs";
import type { Postulacion, EstatusPostulacion } from "@/types/applications";
import { COLUMNAS_KANBAN } from "@/types/applications";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { PageLoading, EmptyState } from "@/components/ui/PageState";
import { Avatar } from "@/components/ui/Avatar";
import { FileTextIcon } from "@/components/ui/icons";

const TONO_ESTATUS: Record<EstatusPostulacion, BadgeTone> = {
  POSTULADO: "neutral",
  VISTO: "navy",
  EN_CONTACTO: "warning",
  ENTREVISTA: "orange",
  CONTRATADO: "success",
  NO_SELECCIONADO: "danger",
};

const ETIQUETA_ESTATUS: Record<EstatusPostulacion, string> = Object.fromEntries(
  COLUMNAS_KANBAN.map((c) => [c.estatus, c.titulo])
) as Record<EstatusPostulacion, string>;

function tonoPorPorcentajeCv(porcentaje: number): BadgeTone {
  if (porcentaje >= 100) return "success";
  if (porcentaje >= 50) return "warning";
  return "danger";
}

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
    return <PageLoading label="Cargando tu dashboard..." />;
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
          <Link href="/chat" className={buttonClasses("outline", "md")}>
            Mensajes
          </Link>
          <Link href="/company/jobs/new" className={buttonClasses("primary", "md")}>
            Publicar vacante
          </Link>
        </div>
      </div>

      <h2 className="font-semibold text-navy mb-3">Mis vacantes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {vacantes.length === 0 && <EmptyState>Aún no has publicado vacantes.</EmptyState>}
        {vacantes.map((v) => (
          <Card key={v.id} className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-navy">{v.titulo}</h3>
              <div className="flex gap-1.5 flex-wrap justify-end">
                <Badge tone={v.aprobada ? "success" : "warning"}>
                  {v.aprobada ? "Aprobada" : "Pendiente de aprobación"}
                </Badge>
                {!v.activa && <Badge tone="neutral">Pausada</Badge>}
              </div>
            </div>
            <p className="text-sm text-black/60 mt-1">{v._count?.postulaciones ?? 0} postulación(es)</p>
            <div className="mt-4 flex gap-2">
              <Link href={`/company/jobs/edit?id=${v.id}`} className={buttonClasses("outline", "sm")}>
                Editar
              </Link>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => handleTogglePausa(v)}
                disabled={cambiandoEstado === v.id}
              >
                {cambiandoEstado === v.id ? "..." : v.activa ? "Pausar" : "Activar"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="font-semibold text-navy mb-3">Candidatos</h2>
      {postulaciones.length === 0 ? (
        <EmptyState>Todavía no han recibido postulaciones.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-surface/70 text-left text-xs uppercase tracking-wide text-black/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Estudiante</th>
                <th className="px-4 py-3 font-semibold">Vacante</th>
                <th className="px-4 py-3 font-semibold">CV</th>
                <th className="px-4 py-3 font-semibold">Estatus</th>
                <th className="px-4 py-3 font-semibold">Actualizar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {postulaciones.map((p, i) => (
                <tr key={p.id} className={`transition-colors hover:bg-orange/5 ${i % 2 === 1 ? "bg-surface/30" : ""}`}>
                  <td className="px-4 py-3">
                    {p.estudiante ? (
                      <div className="flex items-center gap-3">
                        <Avatar
                          nombre={p.estudiante.nombreCompleto ?? p.estudiante.matricula}
                          className="h-9 w-9 text-xs"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-navy truncate">
                            {p.estudiante.nombreCompleto ?? p.estudiante.matricula}
                          </p>
                          <p className="text-xs text-black/50 truncate">
                            {p.estudiante.matricula} · {p.estudiante.carrera.clave} · {p.estudiante.usuario.correo}
                          </p>
                        </div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-black/80">{p.vacante.titulo}</td>
                  <td className="px-4 py-3">
                    {p.estudiante?.cv ? (
                      <a
                        href={urlCompletaDelCv(p.estudiante.cv.archivoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-orange font-medium hover:underline"
                      >
                        <FileTextIcon className="h-4 w-4" />
                        <Badge tone={tonoPorPorcentajeCv(p.estudiante.cv.porcentaje)}>
                          {p.estudiante.cv.porcentaje}%
                        </Badge>
                      </a>
                    ) : (
                      <span className="text-black/40">Sin CV</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={TONO_ESTATUS[p.estatus]}>{ETIQUETA_ESTATUS[p.estatus] ?? p.estatus}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      size="sm"
                      value={p.estatus}
                      onChange={(e) => handleCambiarEstatus(p.id, e.target.value as EstatusPostulacion)}
                    >
                      {COLUMNAS_KANBAN.map((c) => (
                        <option key={c.estatus} value={c.estatus}>
                          {c.titulo}
                        </option>
                      ))}
                    </Select>
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
