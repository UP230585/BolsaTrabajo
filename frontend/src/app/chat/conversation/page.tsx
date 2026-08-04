"use client";

import { useEffect, useRef, useState, Suspense, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  obtenerMensajesRequest,
  enviarMensajeRequest,
  obtenerConversacionRequest,
} from "@/services/chat.service";
import { useAuth } from "@/context/AuthContext";
import type { Conversacion, Mensaje } from "@/types/chat";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/PageState";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeftIcon, LockIcon, SendIcon } from "@/components/ui/icons";

const INTERVALO_POLLING_MS = 4000;

export default function ChatConversationPage() {
  return (
    <Suspense fallback={<PageLoading label="Cargando conversación..." />}>
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

  const [conversacion, setConversacion] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    obtenerConversacionRequest(conversacionId).then(setConversacion);
  }, [conversacionId]);

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
    setError(null);
    try {
      const nuevo = await enviarMensajeRequest(conversacionId, texto.trim());
      setMensajes((prev) => [...prev, nuevo]);
      setTexto("");
    } catch {
      setError("No se pudo enviar el mensaje.");
    } finally {
      setEnviando(false);
    }
  }

  const miRol = usuario?.rol === "ESTUDIANTE" ? "ESTUDIANTE" : "EMPRESA";
  const nombreContacto =
    usuario?.rol === "ESTUDIANTE" ? conversacion?.empresa?.razonSocial : conversacion?.estudiante?.usuario.correo;
  const contactoHabilitado = conversacion?.contactoHabilitado ?? false;

  if (cargando) {
    return <PageLoading label="Cargando conversación..." />;
  }

  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-10 flex flex-col flex-1">
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/chat"
          aria-label="Volver a mensajes"
          className="rounded-md p-1.5 -ml-1.5 text-black/50 hover:bg-surface hover:text-navy transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <Avatar nombre={nombreContacto ?? "?"} className="h-9 w-9 text-sm" />
        <h1 className="text-lg font-semibold text-navy truncate">{nombreContacto ?? "Conversación"}</h1>
      </div>

      <div className="flex-1 rounded-lg border border-black/10 bg-white p-4 flex flex-col gap-2 overflow-y-auto min-h-[24rem] max-h-[28rem] shadow-sm">
        {mensajes.length === 0 && (
          <p className="text-sm text-black/50 text-center my-auto">
            Todavía no hay mensajes. Escribe el primero.
          </p>
        )}
        {mensajes.map((m) => {
          const esMio = m.emisorRol === miRol;
          return (
            <div key={m.id} className={`flex animate-fade-up ${esMio ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  esMio ? "bg-navy text-white rounded-br-md" : "bg-surface text-black rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-line">{m.contenido}</p>
                <p className={`text-[10px] mt-1 ${esMio ? "text-white/60" : "text-black/40"}`}>
                  {new Date(m.enviadoEn).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={finRef} />
      </div>

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      {contactoHabilitado ? (
        <form onSubmit={handleEnviar} className="mt-4 flex gap-2">
          <Input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1"
          />
          <Button type="submit" disabled={enviando} className="flex items-center gap-1.5">
            <SendIcon className="h-4 w-4" />
            Enviar
          </Button>
        </form>
      ) : (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-black/15 bg-surface/60 px-4 py-3 text-sm text-black/60">
          <LockIcon className="h-5 w-5 shrink-0 text-black/40" />
          <p>
            Todavía no pueden chatear: la empresa debe marcar la postulación como{" "}
            <span className="font-medium text-navy">&quot;En contacto&quot;</span> (o más avanzada) para habilitar
            los mensajes.
          </p>
        </div>
      )}
    </div>
  );
}
