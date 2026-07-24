"use client";

import { useEffect, useRef, useState, Suspense, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { obtenerMensajesRequest, enviarMensajeRequest } from "@/services/chat.service";
import { useAuth } from "@/context/AuthContext";
import type { Mensaje } from "@/types/chat";

const INTERVALO_POLLING_MS = 4000;

export default function ChatConversationPage() {
  return (
    <Suspense fallback={<p className="text-center py-16 text-black/60">Cargando conversación...</p>}>
      <ChatConversationContent />
    </Suspense>
  );
}

function ChatConversationContent() {
  // Se usa un query param (?id=) en vez de una ruta dinámica ([conversationId])
  // porque el proyecto se exporta como sitio estático para Azure Static Web
  // Apps, que no ejecuta código de servidor.
  const searchParams = useSearchParams();
  const conversacionId = Number(searchParams.get("id"));
  const { usuario } = useAuth();

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  // Carga inicial + "tiempo real" simulado con polling: mientras no haya
  // WebSockets, refrescar cada pocos segundos es suficiente para un chat
  // de baja frecuencia como el de este proyecto.
  useEffect(() => {
    let activo = true;

    async function cargar() {
      const data = await obtenerMensajesRequest(conversacionId);
      if (activo) setMensajes(data);
    }

    cargar().finally(() => setCargando(false));
    const intervalo = setInterval(cargar, INTERVALO_POLLING_MS);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [conversacionId]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function handleEnviar(event: FormEvent) {
    event.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      const nuevo = await enviarMensajeRequest(conversacionId, texto.trim());
      setMensajes((prev) => [...prev, nuevo]);
      setTexto("");
    } finally {
      setEnviando(false);
    }
  }

  const miRol = usuario?.rol === "ESTUDIANTE" ? "ESTUDIANTE" : "EMPRESA";

  if (cargando) {
    return <p className="text-center py-16 text-black/60">Cargando conversación...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-10 flex flex-col flex-1">
      <h1 className="text-xl font-semibold text-navy mb-4">Conversación</h1>

      <div className="flex-1 rounded-lg border border-black/10 bg-white p-4 flex flex-col gap-2 overflow-y-auto min-h-[24rem] max-h-[28rem]">
        {mensajes.length === 0 && (
          <p className="text-sm text-black/50 text-center my-auto">
            Todavía no hay mensajes. Escribe el primero.
          </p>
        )}
        {mensajes.map((m) => {
          const esMio = m.emisorRol === miRol;
          return (
            <div key={m.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  esMio ? "bg-navy text-white" : "bg-surface text-black"
                }`}
              >
                <p>{m.contenido}</p>
                <p className={`text-[10px] mt-1 ${esMio ? "text-white/60" : "text-black/40"}`}>
                  {new Date(m.enviadoEn).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={finRef} />
      </div>

      <form onSubmit={handleEnviar} className="mt-4 flex gap-2">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 rounded-md border border-black/20 px-3 py-2"
        />
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-orange px-5 py-2 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
