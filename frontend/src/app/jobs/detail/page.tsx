"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { obtenerVacanteRequest } from "@/services/jobs.service";
import { postularseRequest } from "@/services/applications.service";
import { useAuth } from "@/context/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import type { Vacante } from "@/types/jobs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/PageState";

const ETIQUETA_MODALIDAD: Record<Vacante["modalidad"], string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  REMOTO: "Remoto",
};

export default function JobDetailPage() {
  return (
    <Suspense fallback={<PageLoading label="Cargando vacante..." />}>
      <JobDetailContent />
    </Suspense>
  );
}

function JobDetailContent() {
  // Se usa un query param (?id=) en vez de una ruta dinámica ([id]) porque
  // el proyecto se exporta como sitio estático para Azure Static Web Apps,
  // que no ejecuta código de servidor: un query param sigue siendo la misma
  // página HTML pre-generada, y el id se lee ya en el navegador.
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));
  const { usuario } = useAuth();

  const {
    data: vacante,
    cargando,
    error,
    recargar,
  } = useAsync<Vacante>(() => obtenerVacanteRequest(id), [id], "No se pudo cargar esta vacante.");
  const [postulando, setPostulando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function handlePostularme() {
    setPostulando(true);
    setMensaje(null);
    try {
      await postularseRequest(id);
      setMensaje("¡Postulación enviada! Revisa el estatus en tu panel Kanban.");
    } catch {
      setMensaje("No se pudo completar la postulación (puede que ya te hayas postulado).");
    } finally {
      setPostulando(false);
    }
  }

  if (cargando) {
    return <PageLoading label="Cargando vacante..." />;
  }

  if (error || !vacante) {
    return (
      <div className="text-center py-16">
        <p className="text-black/60 mb-3">{error ?? "No se encontró la vacante."}</p>
        {error && (
          <Button variant="link" onClick={recargar}>
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-10">
      <Card className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-navy">{vacante.titulo}</h1>
            <p className="text-black/60">{vacante.empresa.razonSocial}</p>
          </div>
          <Badge tone="neutral">{ETIQUETA_MODALIDAD[vacante.modalidad]}</Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="navy">{vacante.carrera.nombre}</Badge>
          <Badge tone="navy">Desde {vacante.cuatrimestreMin}° cuatrimestre</Badge>
          {vacante.salario && (
            <Badge tone="success">${Number(vacante.salario).toLocaleString("es-MX")}</Badge>
          )}
        </div>

        <h2 className="mt-6 font-semibold text-navy">Descripción</h2>
        <p className="mt-2 text-black/80 whitespace-pre-line">{vacante.descripcion}</p>

        {usuario?.rol === "ESTUDIANTE" && (
          <div className="mt-8">
            <Button size="lg" onClick={handlePostularme} disabled={postulando}>
              {postulando ? "Enviando..." : "Postularme con un clic"}
            </Button>
            {mensaje && <p className="mt-3 text-sm text-black/70">{mensaje}</p>}
          </div>
        )}

        {!usuario && (
          <p className="mt-8 text-sm text-black/60">
            Inicia sesión como estudiante para postularte a esta vacante.
          </p>
        )}
      </Card>
    </div>
  );
}
