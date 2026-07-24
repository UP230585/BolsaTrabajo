"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { listarCarrerasRequest } from "@/services/carreras.service";
import { crearVacanteRequest } from "@/services/jobs.service";
import type { Carrera, Modalidad } from "@/types/jobs";

export default function NuevaVacantePage() {
  const router = useRouter();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    carreraId: 0,
    cuatrimestreMin: 1,
    modalidad: "PRESENCIAL" as Modalidad,
    salario: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarCarrerasRequest().then((data) => {
      setCarreras(data);
      if (data[0]) setForm((f) => ({ ...f, carreraId: data[0].id }));
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await crearVacanteRequest({
        ...form,
        salario: form.salario ? Number(form.salario) : undefined,
      });
      router.push("/company/dashboard");
    } catch {
      setError("No se pudo publicar la vacante. Verifica los datos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy mb-1">Publicar vacante</h1>
      <p className="text-black/60 mb-8">
        Tu vacante quedará pendiente de aprobación por la Coordinación antes de ser visible.
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
          {enviando ? "Publicando..." : "Publicar vacante"}
        </button>
      </form>
    </div>
  );
}
