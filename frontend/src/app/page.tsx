import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const ESTADISTICAS = [
  { valor: "9", etiqueta: "Carreras de la UPA" },
  { valor: "100%", etiqueta: "Vacantes validadas por Coordinación" },
  { valor: "1 clic", etiqueta: "Para postularte" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5" aria-hidden />
        <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-orange/10" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight animate-fade-up">
              Conectamos el talento de la UPA con las empresas de Aguascalientes
            </h1>
            <p className="text-white/80 max-w-xl mx-auto md:mx-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Encuentra prácticas profesionales, residencias y tu primer empleo,
              filtrado automáticamente por tu carrera y cuatrimestre.
            </p>
            <Link
              href="/jobs"
              className={buttonClasses("primary", "lg", "animate-fade-up")}
              style={{ animationDelay: "0.2s" }}
            >
              Buscar vacantes
            </Link>
          </div>
          <div className="flex-1 w-full max-w-md rounded-lg bg-white/5 border border-white/10 p-6 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange mb-4">
              ¿Cómo funciona?
            </p>
            <ol className="space-y-4">
              {[
                { paso: "Crea tu cuenta", detalle: "Con tu correo institucional y los datos de tu carrera." },
                { paso: "Sube tu CV", detalle: "Lo analizamos al instante y te decimos qué le falta." },
                { paso: "Postula en 1 clic", detalle: "Y da seguimiento a cada proceso desde tu dashboard." },
              ].map((item, i) => (
                <li key={item.paso} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-white">{item.paso}</p>
                    <p className="text-sm text-white/70">{item.detalle}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {ESTADISTICAS.map((stat) => (
            <div key={stat.etiqueta}>
              <p className="text-3xl font-bold text-navy">{stat.valor}</p>
              <p className="text-sm text-black/60">{stat.etiqueta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="mx-auto max-w-6xl w-full px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-8 hover:shadow-md hover:border-navy/20 transition-all">
          <h2 className="text-xl font-semibold text-navy mb-2">Soy estudiante</h2>
          <p className="text-black/60 mb-4">
            Valida tu CV, encuentra vacantes de tu carrera y da seguimiento a tus
            postulaciones en un solo lugar.
          </p>
          <Link href="/register/estudiante" className="text-orange font-medium hover:underline">
            Crear cuenta de estudiante →
          </Link>
        </Card>
        <Card className="p-8 hover:shadow-md hover:border-navy/20 transition-all">
          <h2 className="text-xl font-semibold text-navy mb-2">Soy empresa</h2>
          <p className="text-black/60 mb-4">
            Publica vacantes segmentadas por carrera y cuatrimestre, y recibe
            candidatos ya validados por la plataforma.
          </p>
          <Link href="/register/empresa" className="text-orange font-medium hover:underline">
            Registrar mi empresa →
          </Link>
        </Card>
      </section>
    </div>
  );
}
