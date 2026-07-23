import Link from "next/link";

const ESTADISTICAS = [
  { valor: "9", etiqueta: "Carreras de la UPA" },
  { valor: "100%", etiqueta: "Vacantes validadas por Coordinación" },
  { valor: "1 clic", etiqueta: "Para postularte" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              Conectamos el talento de la UPA con las empresas de Aguascalientes
            </h1>
            <p className="text-white/80 max-w-xl mx-auto md:mx-0">
              Encuentra prácticas profesionales, residencias y tu primer empleo,
              filtrado automáticamente por tu carrera y cuatrimestre.
            </p>
            <Link
              href="/jobs"
              className="inline-block rounded-md bg-orange px-6 py-3 font-medium hover:opacity-90 transition-opacity"
            >
              Buscar vacantes
            </Link>
          </div>
          <div className="flex-1 w-full max-w-md rounded-lg bg-white/5 border border-white/10 p-6">
            <p className="text-sm text-white/70">
              Aqui vamos a poner algo
            </p>
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
      <section className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-black/10 p-8">
          <h2 className="text-xl font-semibold text-navy mb-2">Soy estudiante</h2>
          <p className="text-black/60 mb-4">
            Valida tu CV, encuentra vacantes de tu carrera y da seguimiento a tus
            postulaciones en un solo lugar.
          </p>
          <Link href="/register/estudiante" className="text-orange font-medium hover:underline">
            Crear cuenta de estudiante →
          </Link>
        </div>
        <div className="rounded-lg border border-black/10 p-8">
          <h2 className="text-xl font-semibold text-navy mb-2">Soy empresa</h2>
          <p className="text-black/60 mb-4">
            Publica vacantes segmentadas por carrera y cuatrimestre, y recibe
            candidatos ya validados por la plataforma.
          </p>
          <Link href="/register/empresa" className="text-orange font-medium hover:underline">
            Registrar mi empresa →
          </Link>
        </div>
      </section>
    </div>
  );
}
