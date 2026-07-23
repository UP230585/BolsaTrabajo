"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { obtenerVacanteRequest } from "@/services/jobs.service";
import { postularseRequest } from "@/services/applications.service";
import { useAuth } from "@/context/AuthContext";
import type { Vacante } from "@/types/jobs";

const ETIQUETA_MODALIDAD: Record<Vacante["modalidad"], string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  REMOTO: "Remoto",
};

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const { usuario } = useAuth();

  const [vacante, setVacante] = useState<Vacante | null>(null);
  const [cargando, setCargando] = useState(true);
  const [postulando, setPostulando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    obtenerVacanteRequest(Number(params.id))
      .then(setVacante)
      .finally(() => setCargando(false));
  }, [params.id]);

  async function handlePostularme() {
    setPostulando(true);
    setMensaje(null);
    try {
      await postularseRequest(Number(params.id));
      setMensaje("¡Postulación enviada! Revisa el estatus en tu panel Kanban.");
    } catch {
      setMensaje("No se pudo completar la postulación (puede que ya te hayas postulado).");
    } finally {
      setPostulando(false);
    }
  }

  if (cargando) {
    return <p className="text-center py-16 text-black/60">Cargando vacante...</p>;
  }

  if (!vacante) {
    return <p className="text-center py-16 text-black/60">No se encontró la vacante.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-10">
      <div className="rounded-lg border border-black/10 bg-white p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-navy">{vacante.titulo}</h1>
            <p className="text-black/60">{vacante.empresa.razonSocial}</p>
          </div>
          <span className="text-xs rounded-full bg-surface px-3 py-1 text-black/60 whitespace-nowrap">
            {ETIQUETA_MODALIDAD[vacante.modalidad]}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-navy/10 text-navy px-2 py-1">{vacante.carrera.nombre}</span>
          <span className="rounded-full bg-navy/10 text-navy px-2 py-1">
            Desde {vacante.cuatrimestreMin}° cuatrimestre
          </span>
          {vacante.salario && (
            <span className="rounded-full bg-success/10 text-success px-2 py-1">
              ${Number(vacante.salario).toLocaleString("es-MX")}
            </span>
          )}
        </div>

        <h2 className="mt-6 font-semibold text-navy">Descripción</h2>
        <p className="mt-2 text-black/80 whitespace-pre-line">{vacante.descripcion}</p>

        {usuario?.rol === "ESTUDIANTE" && (
          <div className="mt-8">
            <button
              onClick={handlePostularme}
              disabled={postulando}
              className="rounded-md bg-orange px-6 py-3 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {postulando ? "Enviando..." : "Postularme con un clic"}
            </button>
            {mensaje && <p className="mt-3 text-sm text-black/70">{mensaje}</p>}
          </div>
        )}

        {!usuario && (
          <p className="mt-8 text-sm text-black/60">
            Inicia sesión como estudiante para postularte a esta vacante.
          </p>
        )}
      </div>
    </div>
  );
}
