"use client";

import Link from "next/link";
import { misConversacionesRequest } from "@/services/chat.service";
import { useAuth } from "@/context/AuthContext";
import { useAsync } from "@/hooks/useAsync";

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
    return <p className="text-center py-16 text-black/60">Cargando conversaciones...</p>;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-black/60 mb-3">{error}</p>
        <button onClick={recargar} className="text-orange text-sm font-medium hover:underline">
          Reintentar
        </button>
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
        <p className="text-black/60">Todavía no tienes conversaciones activas.</p>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white divide-y divide-black/5">
          {conversaciones.map((c) => {
            const ultimoMensaje = c.mensajes?.[0];
            const nombre = usuario?.rol === "ESTUDIANTE" ? c.empresa?.razonSocial : c.estudiante?.usuario.correo;
            return (
              <Link
                key={c.id}
                href={`/chat/conversation?id=${c.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-surface transition-colors"
              >
                <div>
                  <p className="font-medium text-navy">{nombre ?? "Conversación"}</p>
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
