"use client";

import Link from "next/link";
import { Semaforo } from "@/components/Semaforo";
import { miPerfilRequest } from "@/services/students.service";
import { useAuth } from "@/context/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { Card } from "@/components/ui/Card";
import { PageLoading } from "@/components/ui/PageState";
import { Button } from "@/components/ui/Button";

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
      <h1 className="text-2xl font-semibold text-navy mb-1">
        Hola, {usuario?.correo.split("@")[0]} 👋
      </h1>
      <p className="text-black/60 mb-8">
        {perfil.carrera.nombre} · {perfil.cuatrimestre}° cuatrimestre
      </p>

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
            <ul className="space-y-2">
              {perfil.insignias.map((ei) => (
                <li key={ei.insignia.nombre} className="text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange" />
                  {ei.insignia.nombre}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6 flex flex-col gap-3">
          <h2 className="font-semibold text-navy">Accesos rápidos</h2>
          <Link href="/jobs" className="text-orange text-sm font-medium hover:underline">
            Ver vacantes recomendadas →
          </Link>
          <Link href="/student/applications" className="text-orange text-sm font-medium hover:underline">
            Ver mis postulaciones →
          </Link>
        </Card>
      </div>
    </div>
  );
}
