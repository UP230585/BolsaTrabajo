"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { misPostulacionesRequest } from "@/services/applications.service";
import { iniciarConversacionRequest } from "@/services/chat.service";
import { COLUMNAS_KANBAN, type Postulacion } from "@/types/applications";
import { PageLoading, EmptyState } from "@/components/ui/PageState";

export default function StudentApplicationsPage() {
  const router = useRouter();
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [abriendoChatId, setAbriendoChatId] = useState<number | null>(null);

  useEffect(() => {
    misPostulacionesRequest()
      .then(setPostulaciones)
      .finally(() => setCargando(false));
  }, []);

  async function handleAbrirChat(vacanteId: number) {
    setAbriendoChatId(vacanteId);
    try {
      const conversacion = await iniciarConversacionRequest(vacanteId);
      router.push(`/chat/conversation?id=${conversacion.id}`);
    } finally {
      setAbriendoChatId(null);
    }
  }

  if (cargando) {
    return <PageLoading label="Cargando tus postulaciones..." />;
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy mb-1">Mis postulaciones</h1>
      <p className="text-black/60 mb-8">Seguimiento de tus aplicaciones laborales.</p>

      {postulaciones.length === 0 ? (
        <EmptyState>Todavía no te has postulado a ninguna vacante.</EmptyState>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNAS_KANBAN.map((columna) => {
            const items = postulaciones.filter((p) => p.estatus === columna.estatus);
            return (
              <div key={columna.estatus} className="w-64 shrink-0 bg-surface rounded-lg p-3">
                <h2 className="text-sm font-semibold text-navy mb-3 flex items-center justify-between">
                  {columna.titulo}
                  <span className="text-xs bg-white rounded-full px-2 py-0.5">{items.length}</span>
                </h2>
                <div className="space-y-2">
                  {items.map((p) => (
                    <div key={p.id} className="rounded-lg bg-white border border-black/10 p-3">
                      <p className="text-sm font-medium text-navy">{p.vacante.titulo}</p>
                      <p className="text-xs text-black/60">{p.vacante.empresa.razonSocial}</p>
                      <p className="text-[10px] text-black/40 mt-1">
                        {new Date(p.creadaEn).toLocaleDateString("es-MX")}
                      </p>
                      <button
                        onClick={() => handleAbrirChat(p.vacante.id)}
                        disabled={abriendoChatId === p.vacante.id}
                        className="mt-2 text-xs text-orange font-medium hover:underline disabled:opacity-50"
                      >
                        {abriendoChatId === p.vacante.id ? "Abriendo..." : "Chatear con la empresa →"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
