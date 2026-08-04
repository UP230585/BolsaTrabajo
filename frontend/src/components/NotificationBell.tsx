"use client";

import { useEffect, useRef, useState } from "react";
import {
  misNotificacionesRequest,
  marcarNotificacionLeidaRequest,
  marcarTodasLeidasRequest,
} from "@/services/notifications.service";
import type { Notificacion } from "@/types/notifications";
import { BellIcon } from "./ui/icons";

const INTERVALO_REFRESCO_MS = 30_000;

function tiempoRelativo(fechaIso: string): string {
  const minutos = Math.max(0, Math.round((Date.now() - new Date(fechaIso).getTime()) / 60_000));
  if (minutos < 1) return "justo ahora";
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  return `hace ${Math.round(horas / 24)} d`;
}

export function NotificationBell() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  function cargar() {
    misNotificacionesRequest()
      .then(setNotificaciones)
      .catch(() => {
        /* si falla el refresco silencioso, se intenta de nuevo en el siguiente intervalo */
      });
  }

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, INTERVALO_REFRESCO_MS);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    function handleClickFuera(event: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  async function handleMarcarLeida(id: number) {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    await marcarNotificacionLeidaRequest(id).catch(() => cargar());
  }

  async function handleMarcarTodas() {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    await marcarTodasLeidasRequest().catch(() => cargar());
  }

  return (
    <div ref={contenedorRef} className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Notificaciones"
        className="relative rounded-md p-2 hover:bg-white/10 transition-colors"
      >
        <BellIcon className="h-5 w-5" aria-hidden />
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-semibold text-white">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border border-black/10 bg-white text-black shadow-lg z-50 origin-top-right animate-pop-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
            <span className="font-semibold text-navy text-sm">Notificaciones</span>
            {noLeidas > 0 && (
              <button onClick={handleMarcarTodas} className="text-xs text-orange hover:underline">
                Marcar todas como leídas
              </button>
            )}
          </div>

          {notificaciones.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-black/50">No tienes notificaciones.</p>
          ) : (
            <ul>
              {notificaciones.map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.leida && handleMarcarLeida(n.id)}
                  className={`px-4 py-3 border-b border-black/5 last:border-0 text-sm cursor-pointer ${
                    n.leida ? "text-black/50" : "bg-orange/5 font-medium text-black/80"
                  }`}
                >
                  <p>{n.mensaje}</p>
                  <p className="mt-1 text-[11px] text-black/40">{tiempoRelativo(n.creadaEn)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
