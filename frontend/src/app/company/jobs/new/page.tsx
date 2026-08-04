"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { listarCarrerasRequest } from "@/services/carreras.service";
import { crearVacanteRequest } from "@/services/jobs.service";
import type { Carrera, Modalidad } from "@/types/jobs";
import { Label, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

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
          {enviando ? "Publicando..." : "Publicar vacante"}
        </Button>
      </form>
    </div>
  );
}
