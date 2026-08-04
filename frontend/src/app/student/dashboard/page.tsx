"use client";

import Link from "next/link";
import { Semaforo } from "@/components/Semaforo";
import { miPerfilRequest } from "@/services/students.service";
import { useAuth } from "@/context/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoading } from "@/components/ui/PageState";
import { Button } from "@/components/ui/Button";
import { BriefcaseIcon, FileTextIcon } from "@/components/ui/icons";

export default function StudentDashboardPage() {
  const { usuario } = useAuth();
  const {
    data: perfil,
    cargando,
    error,
    recargar,
  } = useAsync(() => miPerfilRequest(), [], "No se pudo cargar tu perfil. Intenta de nuevo.");

  if (cargando) {
    return <PageLoading label="Cargando tu dashboard..." />;
  }

  if (error || !perfil) {
    return (
      <div className="text-center py-16">
        <p className="text-black/60 mb-3">{error ?? "No se pudo cargar tu perfil."}</p>
        <Button variant="link" onClick={recargar}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-6 py-10">
      <div className="relative overflow-hidden rounded-xl bg-navy text-white px-8 py-8 mb-8">
        <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/5" aria-hidden />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-orange/10" aria-hidden />
        <div className="relative">
          <h1 className="text-2xl font-semibold mb-1">Hola, {usuario?.correo.split("@")[0]} 👋</h1>
          <p className="text-white/70">
            {perfil.carrera.nombre} · {perfil.cuatrimestre}° cuatrimestre
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center text-center gap-3">
          <Semaforo porcentaje={perfil.porcentajeCV} />
          <p className="text-sm text-black/60">
            {perfil.porcentajeCV >= 100
              ? "¡Tu perfil está completo!"
              : "Completa tu CV para que las empresas te vean."}
          </p>
          <Link href="/student/profile" className="text-orange text-sm font-medium hover:underline">
            Completar perfil →
          </Link>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-navy mb-3">Insignias</h2>
          {perfil.insignias.length === 0 ? (
            <p className="text-sm text-black/60">Aún no tienes insignias.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {perfil.insignias.map((ei) => (
                <Badge key={ei.insignia.nombre} tone="orange">
                  {ei.insignia.nombre}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 flex flex-col gap-2">
          <h2 className="font-semibold text-navy mb-1">Accesos rápidos</h2>
          <Link
            href="/jobs"
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 -mx-2 text-sm font-medium text-black/80 hover:bg-surface hover:text-orange transition-colors"
          >
            <BriefcaseIcon className="h-4 w-4 shrink-0" />
            Ver vacantes recomendadas
          </Link>
          <Link
            href="/student/applications"
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 -mx-2 text-sm font-medium text-black/80 hover:bg-surface hover:text-orange transition-colors"
          >
            <FileTextIcon className="h-4 w-4 shrink-0" />
            Ver mis postulaciones
          </Link>
        </Card>
      </div>
    </div>
  );
}
