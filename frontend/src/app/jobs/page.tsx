"use client";

import { useEffect, useState } from "react";
import { JobCard } from "@/components/JobCard";
import { listarVacantesRequest } from "@/services/jobs.service";
import { listarCarrerasRequest } from "@/services/carreras.service";
import { useAsync } from "@/hooks/useAsync";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { Vacante, Carrera, Modalidad } from "@/types/jobs";

export default function JobsPage() {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [carreraId, setCarreraId] = useState<number | "">("");
  const [cuatrimestre, setCuatrimestre] = useState<number | "">("");
  const [modalidad, setModalidad] = useState<Modalidad | "">("");
  const [busqueda, setBusqueda] = useState("");
  // Espera a que la persona deje de escribir antes de disparar la búsqueda,
  // para no mandar una petición por cada letra (ver hooks/useDebouncedValue).
  const q = useDebouncedValue(busqueda.trim(), 350);

  const [errorCarreras, setErrorCarreras] = useState<string | null>(null);

  useEffect(() => {
    // Si el catálogo de carreras falla, el filtro simplemente queda vacío
    // (no bloquea ver vacantes), pero sí se avisa para no dejar al usuario
    // pensando que no hay carreras registradas.
    listarCarrerasRequest()
      .then(setCarreras)
      .catch(() => {
        setCarreras([]);
        setErrorCarreras("No se pudieron cargar las carreras para el filtro.");
      });
  }, []);

  const {
    data: vacantesData,
    cargando,
    error: errorVacantes,
  } = useAsync(
    () =>
      listarVacantesRequest({
        ...(carreraId ? { carreraId } : {}),
        ...(cuatrimestre ? { cuatrimestre } : {}),
        ...(modalidad ? { modalidad } : {}),
        ...(q ? { q } : {}),
      }),
    [carreraId, cuatrimestre, modalidad, q],
    "No se pudieron cargar las vacantes. Revisa tu conexión e intenta de nuevo."
  );
  const vacantes = vacantesData ?? [];
  const error = errorVacantes ?? errorCarreras;

  return (
    <div className="mx-auto max-w-6xl w-full px-6 py-10 flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-56 shrink-0 space-y-6">
        <h2 className="font-semibold text-navy">Filtros</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Buscar</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Título o palabra clave"
            className="w-full rounded-md border border-black/20 px-2 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Carrera</label>
          <select
            value={carreraId}
            onChange={(e) => setCarreraId(e.target.value ? Number(e.target.value) : "")}
            className="w-full rounded-md border border-black/20 px-2 py-1.5 text-sm"
          >
            <option value="">Todas</option>
            {carreras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.clave}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cuatrimestre</label>
          <select
            value={cuatrimestre}
            onChange={(e) => setCuatrimestre(e.target.value ? Number(e.target.value) : "")}
            className="w-full rounded-md border border-black/20 px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {Array.from({ length: 9 }, (_, i) => i + 1).map((c) => (
              <option key={c} value={c}>
                {c}°
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Modalidad</label>
          <select
            value={modalidad}
            onChange={(e) => setModalidad(e.target.value as Modalidad | "")}
            className="w-full rounded-md border border-black/20 px-2 py-1.5 text-sm"
          >
            <option value="">Todas</option>
            <option value="PRESENCIAL">Presencial</option>
            <option value="HIBRIDO">Híbrido</option>
            <option value="REMOTO">Remoto</option>
          </select>
        </div>
      </aside>

      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-navy mb-6">Vacantes disponibles</h1>

        {error && <p className="mb-4 text-sm text-danger">{error}</p>}

        {cargando && <p className="text-black/60">Cargando vacantes...</p>}

        {!cargando && vacantes.length === 0 && (
          <p className="text-black/60">No hay vacantes que coincidan con esos filtros.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vacantes.map((v) => (
            <JobCard key={v.id} vacante={v} />
          ))}
        </div>
      </div>
    </div>
  );
}
