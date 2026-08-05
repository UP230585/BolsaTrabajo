const RELATIVO = new Intl.RelativeTimeFormat("es-MX", { numeric: "auto" });

/** "hace 3 días", "hoy", etc. a partir de una fecha ISO. */
export function fechaRelativa(iso: string): string {
  const dias = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  return RELATIVO.format(dias, "day");
}

/** true si la fecha límite (ISO) ya pasó. */
export function estaVencida(fechaLimiteIso: string): boolean {
  return new Date(fechaLimiteIso).getTime() < Date.now();
}
