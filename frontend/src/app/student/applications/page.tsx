"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { misPostulacionesRequest } from "@/services/applications.service";
import { iniciarConversacionRequest } from "@/services/chat.service";
import { useAsync } from "@/hooks/useAsync";
import { COLUMNAS_KANBAN, type EstatusPostulacion } from "@/types/applications";
import { PageLoading, EmptyState } from "@/components/ui/PageState";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { BriefcaseIcon, ChatBubbleIcon } from "@/components/ui/icons";

const TONO_POR_ESTATUS: Record<EstatusPostulacion, BadgeTone> = {
  POSTULADO: "neutral",
  VISTO: "navy",
  EN_CONTACTO: "warning",
  ENTREVISTA: "orange",
  CONTRATADO: "success",
  NO_SELECCIONADO: "danger",
};

// Clases completas (no interpoladas) para que Tailwind las detecte en el build.
const BORDE_POR_TONO: Record<BadgeTone, string> = {
  neutral: "border-l-black/20",
  navy: "border-l-navy",
  warning: "border-l-warning",
  orange: "border-l-orange",
  success: "border-l-success",
  danger: "border-l-danger",
};

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
    return <PageLoading label="Cargando tus postulaciones..." />;
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
        <EmptyState>Todavía no te has postulado a ninguna vacante.</EmptyState>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNAS_KANBAN.map((columna) => {
            const items = postulaciones.filter((p) => p.estatus === columna.estatus);
            const tono = TONO_POR_ESTATUS[columna.estatus];
            return (
              <div key={columna.estatus} className="w-64 shrink-0 bg-surface rounded-lg p-3">
                <h2 className="text-sm font-semibold text-navy mb-3 flex items-center justify-between">
                  {columna.titulo}
                  <Badge tone={tono}>{items.length}</Badge>
                </h2>
                <div className="space-y-2">
                  {items.map((p) => (
                    <Card key={p.id} className={`border-l-4 p-3 hover:shadow-md transition-shadow ${BORDE_POR_TONO[tono]}`}>
                      <p className="text-sm font-medium text-navy">{p.vacante.titulo}</p>
                      <p className="text-xs text-black/60 flex items-center gap-1.5 mt-0.5">
                        <BriefcaseIcon className="h-3 w-3 shrink-0" />
                        {p.vacante.empresa.razonSocial}
                      </p>
                      <p className="text-[10px] text-black/40 mt-1">
                        {new Date(p.creadaEn).toLocaleDateString("es-MX")}
                      </p>
                      <button
                        onClick={() => handleAbrirChat(p.vacante.id)}
                        disabled={abriendoChatId === p.vacante.id}
                        className="mt-2 flex items-center gap-1.5 text-xs text-orange font-medium hover:underline disabled:opacity-50"
                      >
                        <ChatBubbleIcon className="h-3.5 w-3.5 shrink-0" />
                        {abriendoChatId === p.vacante.id ? "Abriendo..." : "Chatear con la empresa"}
                      </button>
                    </Card>
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
