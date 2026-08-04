"use client";

import { useEffect, useState } from "react";

/**
 * Hook personalizado que retrasa la propagación de un valor hasta que deja
 * de cambiar durante `delayMs` milisegundos. Se usa en el buscador de
 * vacantes (frontend/src/app/jobs/page.tsx) para no disparar una petición
 * al backend por cada tecla que escribe el usuario, sino solo cuando deja
 * de escribir.
 */
export function useDebouncedValue<T>(valor: T, delayMs = 350): T {
  const [valorDebounced, setValorDebounced] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setValorDebounced(valor), delayMs);
    return () => clearTimeout(temporizador);
  }, [valor, delayMs]);

  return valorDebounced;
}
