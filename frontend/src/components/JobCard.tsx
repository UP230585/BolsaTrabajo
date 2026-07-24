import Link from "next/link";
import type { Vacante } from "@/types/jobs";

const ETIQUETA_MODALIDAD: Record<Vacante["modalidad"], string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  REMOTO: "Remoto",
};

export function JobCard({ vacante }: { vacante: Vacante }) {
  return (
    <Link
      href={`/jobs/detail?id=${vacante.id}`}
      className="block rounded-lg border border-black/10 p-5 hover:border-navy transition-colors bg-white"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-navy">{vacante.titulo}</h3>
          <p className="text-sm text-black/60">{vacante.empresa.razonSocial}</p>
        </div>
        <span className="text-xs rounded-full bg-surface px-2 py-1 text-black/60 whitespace-nowrap">
          {ETIQUETA_MODALIDAD[vacante.modalidad]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-navy/10 text-navy px-2 py-1">{vacante.carrera.clave}</span>
        <span className="rounded-full bg-navy/10 text-navy px-2 py-1">
          Desde {vacante.cuatrimestreMin}° cuatrimestre
        </span>
        {vacante.salario && (
          <span className="rounded-full bg-success/10 text-success px-2 py-1">
            ${Number(vacante.salario).toLocaleString("es-MX")}
          </span>
        )}
      </div>
    </Link>
  );
}
