import Link from "next/link";
import type { Vacante } from "@/types/jobs";
import { Badge } from "./ui/Badge";

const ETIQUETA_MODALIDAD: Record<Vacante["modalidad"], string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  REMOTO: "Remoto",
};

export function JobCard({ vacante }: { vacante: Vacante }) {
  return (
    <Link
      href={`/jobs/detail?id=${vacante.id}`}
      className="block rounded-lg border border-black/10 p-5 hover:border-navy hover:shadow-md hover:-translate-y-0.5 transition-all bg-white"
    >
      <div className="flex items-start justify-between gap-2">
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
      </div>
    </Link>
  );
}
