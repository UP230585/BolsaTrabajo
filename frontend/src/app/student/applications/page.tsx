"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { misPostulacionesRequest } from "@/services/applications.service";
import { iniciarConversacionRequest } from "@/services/chat.service";
import { useAsync } from "@/hooks/useAsync";
import { COLUMNAS_KANBAN } from "@/types/applications";

export default function StudentApplicationsPage() {
  const router = useRouter();
  const {
    data: postulacionesData,
    cargando,
    error,
    recargar,
  } = useAsync(
    () => misPostulacionesRequest(),
    [],
    "No se pudieron cargar tus postulaciones. Intenta de nuevo."
  );
  const postulaciones = postulacionesData ?? [];
  const [abriendoChatId, setAbriendoChatId] = useState<number | null>(null);

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
    return <p className="text-center py-16 text-black/60">Cargando tus postulaciones...</p>;
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy mb-1">Mis postulaciones</h1>
      <p className="text-black/60 mb-8">Seguimiento de tus aplicaciones laborales.</p>

      {error && (
        <p className="mb-4 text-sm text-danger">
          {error}{" "}
          <button onClick={recargar} className="font-medium hover:underline">
            Reintentar
          </button>
        </p>
      )}

      {postulaciones.length === 0 ? (
        <p className="text-black/60">Todavía no te has postulado a ninguna vacante.</p>
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
                    <div key={p.id} className="rounded-md bg-white border border-black/10 p-3">
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
