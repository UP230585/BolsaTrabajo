import Link from "next/link";
import type { Vacante } from "@/types/jobs";
import { Badge } from "./ui/Badge";
import { BookmarkIcon } from "./ui/icons";
import { fechaRelativa, estaVencida } from "@/lib/date";

const ETIQUETA_MODALIDAD: Record<Vacante["modalidad"], string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  REMOTO: "Remoto",
};

interface JobCardProps {
  vacante: Vacante;
  /** Solo se pasa para estudiantes autenticados; si falta, no se muestra el botón. */
  guardada?: boolean;
  onToggleGuardado?: (vacante: Vacante) => void;
}

export function JobCard({ vacante, guardada, onToggleGuardado }: JobCardProps) {
  const vencida = vacante.fechaLimite ? estaVencida(vacante.fechaLimite) : false;

  return (
    <Link
      href={`/jobs/detail?id=${vacante.id}`}
      className="relative block rounded-lg border border-black/10 p-5 hover:border-navy hover:shadow-md hover:-translate-y-0.5 transition-all bg-white"
    >
      {onToggleGuardado && (
        <button
          type="button"
          aria-label={guardada ? "Quitar de guardados" : "Guardar vacante"}
          onClick={(e) => {
            e.preventDefault();
            onToggleGuardado(vacante);
          }}
          className="absolute top-4 right-4 text-navy/40 hover:text-orange transition-colors"
        >
          <BookmarkIcon className="h-5 w-5" fill={guardada ? "currentColor" : "none"} />
        </button>
      )}

      <div className="flex items-start justify-between gap-2 pr-6">
        <div>
          <h3 className="font-semibold text-navy">{vacante.titulo}</h3>
          <p className="text-sm text-black/60">{vacante.empresa.razonSocial}</p>
        </div>
        <Badge tone="neutral">{ETIQUETA_MODALIDAD[vacante.modalidad]}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone="navy">{vacante.carrera.clave}</Badge>
        <Badge tone="navy">Desde {vacante.cuatrimestreMin}° cuatrimestre</Badge>
        {vacante.salario && (
          <Badge tone="success">${Number(vacante.salario).toLocaleString("es-MX")}</Badge>
        )}
        {vacante.fechaLimite && (
          <Badge tone={vencida ? "danger" : "warning"}>
            {vencida ? "Cierre vencido" : `Cierra ${fechaRelativa(vacante.fechaLimite)}`}
          </Badge>
        )}
      </div>

      <p className="mt-3 text-xs text-black/40">Publicada {fechaRelativa(vacante.creadaEn)}</p>
    </Link>
  );
}
