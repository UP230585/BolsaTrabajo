"use client";

import Link from "next/link";
import { misConversacionesRequest } from "@/services/chat.service";
import { useAuth } from "@/context/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { PageLoading, EmptyState } from "@/components/ui/PageState";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChatBubbleIcon } from "@/components/ui/icons";

export default function ChatListPage() {
  const { usuario } = useAuth();
  const {
    data: conversacionesData,
    cargando,
    error,
    recargar,
  } = useAsync(
    () => misConversacionesRequest(),
    [],
    "No se pudieron cargar tus conversaciones."
  );
  const conversaciones = conversacionesData ?? [];

  if (cargando) {
    return <PageLoading label="Cargando conversaciones..." />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-black/60 mb-3">{error}</p>
        <Button variant="link" onClick={recargar}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy mb-1">Mensajes</h1>
      <p className="text-black/60 mb-8">
        {usuario?.rol === "ESTUDIANTE"
          ? "Conversaciones con las empresas a las que te has postulado."
          : "Conversaciones con tus candidatos."}
      </p>

      {conversaciones.length === 0 ? (
        <EmptyState>
          <ChatBubbleIcon className="h-8 w-8 mx-auto mb-3 text-black/30" />
          Todavía no tienes conversaciones activas.
        </EmptyState>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white shadow-sm divide-y divide-black/5 overflow-hidden">
          {conversaciones.map((c) => {
            const ultimoMensaje = c.mensajes?.[0];
            const nombre = usuario?.rol === "ESTUDIANTE" ? c.empresa?.razonSocial : c.estudiante?.usuario.correo;
            return (
              <Link
                key={c.id}
                href={`/chat/conversation?id=${c.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface transition-colors"
              >
                <Avatar nombre={nombre ?? "?"} className="h-11 w-11 text-sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-navy truncate">{nombre ?? "Conversación"}</p>
                    {!c.contactoHabilitado && (
                      <Badge tone="neutral" className="shrink-0">
                        Pendiente de contacto
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-black/60 truncate max-w-md">
                    {ultimoMensaje ? ultimoMensaje.contenido : "Sin mensajes todavía"}
                  </p>
                </div>
                {ultimoMensaje && (
                  <span className="text-xs text-black/40 whitespace-nowrap">
                    {new Date(ultimoMensaje.enviadoEn).toLocaleDateString("es-MX")}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
