"use client";

import { useCallback, useEffect, useState, type DependencyList } from "react";

interface UseAsyncResult<T> {
  /** Resultado de la petición, o null mientras carga / si falló. */
  data: T | null;
  /** true mientras la promesa está pendiente. */
  cargando: boolean;
  /** Mensaje de error listo para mostrar al usuario, o null si no hubo error. */
  error: string | null;
  /** Vuelve a ejecutar la petición (por ejemplo, desde un botón "Reintentar"). */
  recargar: () => void;
}

/**
 * Hook personalizado que encapsula el patrón repetido en casi todas las
 * pantallas del dashboard: pedir datos al backend al montar el componente
 * (o cuando cambian `deps`), mostrar un estado de carga, y manejar el
 * error de forma visible en vez de dejarlo silencioso.
 *
 * Se creó porque antes cada página reimplementaba manualmente
 * useState + useEffect + then/finally sin `catch`, así que una petición
 * fallida dejaba la pantalla en blanco sin explicación (ver Guía de Estilo,
 * sección de manejo de errores). Este hook centraliza esa lógica una sola
 * vez, incluyendo protección contra "setState" en un componente ya
 * desmontado (la bandera `cancelado`).
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: DependencyList,
  mensajeError = "No se pudo cargar la información. Intenta de nuevo."
): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    fn()
      .then((resultado) => {
        if (!cancelado) setData(resultado);
      })
      .catch(() => {
        if (!cancelado) setError(mensajeError);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
    // Las dependencias las controla quien llama al hook; `fn` se omite a
    // propósito porque normalmente es una arrow function nueva en cada
    // render (evita loops infinitos por identidad de función).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, intento]);

  const recargar = useCallback(() => setIntento((i) => i + 1), []);

  return { data, cargando, error, recargar };
}
