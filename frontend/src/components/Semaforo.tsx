function colorPorPorcentaje(porcentaje: number): string {
  if (porcentaje >= 100) return "var(--color-success)";
  if (porcentaje >= 50) return "var(--color-warning)";
  return "var(--color-danger)";
}

export function Semaforo({ porcentaje }: { porcentaje: number }) {
  const color = colorPorPorcentaje(porcentaje);
  const circunferencia = 2 * Math.PI * 42;
  const progreso = (porcentaje / 100) * circunferencia;

  return (
    <div className="relative w-28 h-28">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-surface)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${progreso} ${circunferencia}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-navy">
        {porcentaje}%
      </div>
    </div>
  );
}
