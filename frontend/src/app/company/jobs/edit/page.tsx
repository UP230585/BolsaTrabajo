"use client";

import { useEffect, useState, Suspense, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listarCarrerasRequest } from "@/services/carreras.service";
import { obtenerVacanteRequest, actualizarVacanteRequest } from "@/services/jobs.service";
import type { Carrera, Modalidad } from "@/types/jobs";
import { Label, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/PageState";

export default function EditarVacantePage() {
  return (
    <Suspense fallback={<PageLoading label="Cargando vacante..." />}>
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
    return <PageLoading label="Cargando vacante..." />;
  }

  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy mb-1">Editar vacante</h1>
      <p className="text-black/60 mb-8">
        Al guardar cambios, la vacante vuelve a quedar pendiente de aprobación por la Coordinación.
      </p>

      <form onSubmit={handleSubmit} className="rounded-lg border border-black/10 bg-white shadow-sm p-8 space-y-4">
        <div>
          <Label>Título del puesto</Label>
          <Input
            type="text"
            required
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
        </div>

        <div>
          <Label>Descripción</Label>
          <Textarea
            required
            rows={4}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Carrera requerida</Label>
            <Select
              value={form.carreraId}
              onChange={(e) => setForm({ ...form, carreraId: Number(e.target.value) })}
            >
              {carreras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clave}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Cuatrimestre mínimo</Label>
            <Select
              value={form.cuatrimestreMin}
              onChange={(e) => setForm({ ...form, cuatrimestreMin: Number(e.target.value) })}
            >
              {Array.from({ length: 9 }, (_, i) => i + 1).map((c) => (
                <option key={c} value={c}>
                  {c}°
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Modalidad</Label>
            <Select
              value={form.modalidad}
              onChange={(e) => setForm({ ...form, modalidad: e.target.value as Modalidad })}
            >
              <option value="PRESENCIAL">Presencial</option>
              <option value="HIBRIDO">Híbrido</option>
              <option value="REMOTO">Remoto</option>
            </Select>
          </div>

          <div>
            <Label>Salario (opcional)</Label>
            <Input
              type="number"
              min={0}
              value={form.salario}
              onChange={(e) => setForm({ ...form, salario: e.target.value })}
              placeholder="8000"
            />
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" disabled={enviando} className="w-full">
          {enviando ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}
