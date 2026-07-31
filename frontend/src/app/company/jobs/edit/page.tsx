"use client";

import { useEffect, useState, Suspense, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listarCarrerasRequest } from "@/services/carreras.service";
import { obtenerVacanteRequest, actualizarVacanteRequest } from "@/services/jobs.service";
import type { Carrera, Modalidad } from "@/types/jobs";

export default function EditarVacantePage() {
  return (
    <Suspense fallback={<p className="text-center py-16 text-black/60">Cargando vacante...</p>}>
      <EditarVacanteContent />
    </Suspense>
  );
}

function EditarVacanteContent() {
  // Mismo patrón que jobs/detail: query param (?id=) en vez de ruta dinámica,
  // porque el sitio se exporta estático (ver comentario en jobs/detail/page.tsx).
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    carreraId: 0,
    cuatrimestreMin: 1,
    modalidad: "PRESENCIAL" as Modalidad,
    salario: "",
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    Promise.all([listarCarrerasRequest(), obtenerVacanteRequest(id)])
      .then(([listaCarreras, vacante]) => {
        setCarreras(listaCarreras);
        setForm({
          titulo: vacante.titulo,
          descripcion: vacante.descripcion,
          carreraId: vacante.carrera.id,
          cuatrimestreMin: vacante.cuatrimestreMin,
          modalidad: vacante.modalidad,
          salario: vacante.salario ?? "",
        });
      })
      .catch(() => setError("No se pudo cargar la vacante."))
      .finally(() => setCargando(false));
  }, [id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await actualizarVacanteRequest(id, {
        ...form,
        salario: form.salario ? Number(form.salario) : undefined,
      });
      router.push("/company/dashboard");
    } catch {
      setError("No se pudo guardar la vacante. Verifica los datos.");
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return <p className="text-center py-16 text-black/60">Cargando vacante...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy mb-1">Editar vacante</h1>
      <p className="text-black/60 mb-8">
        Al guardar cambios, la vacante vuelve a quedar pendiente de aprobación por la Coordinación.
      </p>

      <form onSubmit={handleSubmit} className="rounded-lg border border-black/10 bg-white p-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título del puesto</label>
          <input
            type="text"
            required
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full rounded-md border border-black/20 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            required
            rows={4}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="w-full rounded-md border border-black/20 px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Carrera requerida</label>
            <select
              value={form.carreraId}
              onChange={(e) => setForm({ ...form, carreraId: Number(e.target.value) })}
              className="w-full rounded-md border border-black/20 px-3 py-2"
            >
              {carreras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clave}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cuatrimestre mínimo</label>
            <select
              value={form.cuatrimestreMin}
              onChange={(e) => setForm({ ...form, cuatrimestreMin: Number(e.target.value) })}
              className="w-full rounded-md border border-black/20 px-3 py-2"
            >
              {Array.from({ length: 9 }, (_, i) => i + 1).map((c) => (
                <option key={c} value={c}>
                  {c}°
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Modalidad</label>
            <select
              value={form.modalidad}
              onChange={(e) => setForm({ ...form, modalidad: e.target.value as Modalidad })}
              className="w-full rounded-md border border-black/20 px-3 py-2"
            >
              <option value="PRESENCIAL">Presencial</option>
              <option value="HIBRIDO">Híbrido</option>
              <option value="REMOTO">Remoto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Salario (opcional)</label>
            <input
              type="number"
              min={0}
              value={form.salario}
              onChange={(e) => setForm({ ...form, salario: e.target.value })}
              className="w-full rounded-md border border-black/20 px-3 py-2"
              placeholder="8000"
            />
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-md bg-orange px-4 py-2.5 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {enviando ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
