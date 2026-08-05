"use client";

import { useState } from "react";
import { JobCard } from "@/components/JobCard";
import { misGuardadasRequest, quitarVacanteRequest } from "@/services/favorites.service";
import { useAsync } from "@/hooks/useAsync";
import type { Vacante } from "@/types/jobs";
import { PageLoading, EmptyState } from "@/components/ui/PageState";

export default function VacantesGuardadasPage() {
  const {
    data: guardadasData,
    cargando,
    error,
    recargar,
  } = useAsync(() => misGuardadasRequest(), [], "No se pudieron cargar tus vacantes guardadas.");
  const [quitandoId, setQuitandoId] = useState<number | null>(null);

  const vacantes: Vacante[] = (guardadasData ?? []).map((g) => g.vacante);

  async function handleQuitar(vacante: Vacante) {
    setQuitandoId(vacante.id);
    try {
      await quitarVacanteRequest(vacante.id);
      recargar();
    } finally {
      setQuitandoId(null);
    }
  }

  if (cargando) {
    return <PageLoading label="Cargando tus vacantes guardadas..." />;
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy mb-1">Vacantes guardadas</h1>
      <p className="text-black/60 mb-8">Tu lista corta antes de decidir a cuáles postularte.</p>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      {vacantes.length === 0 ? (
        <EmptyState>Todavía no has guardado ninguna vacante.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vacantes.map((v) => (
            <JobCard
              key={v.id}
              vacante={v}
              guardada={quitandoId !== v.id}
              onToggleGuardado={() => handleQuitar(v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
