"use client";

import { useEffect, useState, type FormEvent } from "react";
import { miPerfilEmpresaRequest, actualizarPerfilEmpresaRequest } from "@/services/company.service";
import type { PerfilEmpresa } from "@/types/company";

export default function CompanyProfilePage() {
  const [perfil, setPerfil] = useState<PerfilEmpresa | null>(null);
  const [form, setForm] = useState({ razonSocial: "", giro: "" });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    miPerfilEmpresaRequest()
      .then((data) => {
        setPerfil(data);
        setForm({ razonSocial: data.razonSocial, giro: data.giro });
      })
      .catch(() => setError("No se pudo cargar tu perfil."))
      .finally(() => setCargando(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setGuardado(false);
    setGuardando(true);
    try {
      const actualizado = await actualizarPerfilEmpresaRequest(form);
      setPerfil(actualizado);
      setGuardado(true);
    } catch {
      setError("No se pudo guardar el perfil. Verifica los datos.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return <p className="text-center py-16 text-black/60">Cargando tu perfil...</p>;
  }

  if (!perfil) {
    return <p className="text-center py-16 text-black/60">{error ?? "No se pudo cargar tu perfil."}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy mb-1">Perfil de empresa</h1>
      <p className="text-black/60 mb-8">
        {perfil.usuario.correo} · {perfil._count.vacantes} vacante(s) publicada(s)
      </p>

      <form onSubmit={handleSubmit} className="rounded-lg border border-black/10 bg-white p-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Razón social</label>
          <input
            type="text"
            required
            minLength={2}
            value={form.razonSocial}
            onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
            className="w-full rounded-md border border-black/20 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Giro</label>
          <input
            type="text"
            required
            minLength={2}
            value={form.giro}
            onChange={(e) => setForm({ ...form, giro: e.target.value })}
            className="w-full rounded-md border border-black/20 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">RFC</label>
          <input
            type="text"
            disabled
            value={perfil.rfc}
            className="w-full rounded-md border border-black/10 bg-surface px-3 py-2 text-black/50"
          />
          <p className="text-xs text-black/40 mt-1">
            El RFC no se puede editar aquí: es tu identificador legal, verificado por la Coordinación.
          </p>
        </div>

        <div>
          <span
            className={`inline-block text-xs rounded-full px-2 py-1 ${
              perfil.aprobada ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
            }`}
          >
            {perfil.aprobada ? "Empresa aprobada" : "Pendiente de aprobación"}
          </span>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {guardado && <p className="text-sm text-success">Perfil actualizado.</p>}

        <button
          type="submit"
          disabled={guardando}
          className="w-full rounded-md bg-orange px-4 py-2.5 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
