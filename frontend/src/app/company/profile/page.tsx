"use client";

import { useEffect, useState, type FormEvent } from "react";
import { miPerfilEmpresaRequest, actualizarPerfilEmpresaRequest } from "@/services/company.service";
import type { PerfilEmpresa } from "@/types/company";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoading } from "@/components/ui/PageState";

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
    return <PageLoading label="Cargando tu perfil..." />;
  }

  if (!perfil) {
    return <PageLoading label={error ?? "No se pudo cargar tu perfil."} />;
  }

  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy mb-1">Perfil de empresa</h1>
      <p className="text-black/60 mb-8">
        {perfil.usuario.correo} · {perfil._count.vacantes} vacante(s) publicada(s)
      </p>

      <form onSubmit={handleSubmit} className="rounded-lg border border-black/10 bg-white shadow-sm p-8 space-y-4">
        <div>
          <Label>Razón social</Label>
          <Input
            type="text"
            required
            minLength={2}
            value={form.razonSocial}
            onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
          />
        </div>

        <div>
          <Label>Giro</Label>
          <Input
            type="text"
            required
            minLength={2}
            value={form.giro}
            onChange={(e) => setForm({ ...form, giro: e.target.value })}
          />
        </div>

        <div>
          <Label>RFC</Label>
          <Input type="text" disabled value={perfil.rfc} />
          <p className="text-xs text-black/40 mt-1">
            El RFC no se puede editar aquí: es tu identificador legal, verificado por la Coordinación.
          </p>
        </div>

        <div>
          <Badge tone={perfil.aprobada ? "success" : "warning"}>
            {perfil.aprobada ? "Empresa aprobada" : "Pendiente de aprobación"}
          </Badge>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {guardado && <p className="text-sm text-success">Perfil actualizado.</p>}

        <Button type="submit" disabled={guardando} className="w-full">
          {guardando ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}
