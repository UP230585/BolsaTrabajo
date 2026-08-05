"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Diccionario de segmentos de URL -> texto legible. Los segmentos dinámicos
// ([id], [conversationId]) no tienen nombre real disponible aquí sin pedirlo
// a la API, así que se muestran con una etiqueta genérica ("Detalle").
const ETIQUETAS: Record<string, string> = {
  jobs: "Vacantes",
  student: "Estudiante",
  dashboard: "Dashboard",
  profile: "Mi perfil",
  applications: "Mis postulaciones",
  company: "Empresa",
  new: "Publicar vacante",
  admin: "Administración",
  chat: "Mensajes",
  login: "Iniciar sesión",
  register: "Registro",
  estudiante: "Estudiante",
  empresa: "Empresa",
};

function esSegmentoDinamico(segmento: string): boolean {
  // IDs numéricos (/jobs/7) o cualquier cosa que no esté en el diccionario
  // se trata como "Detalle" para no mostrar un id feo en la miga de pan.
  return /^\d+$/.test(segmento) || !ETIQUETAS[segmento];
}

// Segmentos intermedios que agrupan rutas (student, company, register) pero
// no tienen una page.tsx propia: si se convierten en link, dan 404. Se
// muestran como texto plano en vez de enlace.
const SIN_PAGINA_PROPIA = new Set(["/student", "/company", "/register", "/company/jobs"]);

export function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segmentos = pathname.split("/").filter(Boolean);

  const items = segmentos.map((segmento, index) => {
    const href = "/" + segmentos.slice(0, index + 1).join("/");
    const esUltimo = index === segmentos.length - 1;
    const etiqueta = esSegmentoDinamico(segmento)
      ? (esUltimo ? "Detalle" : ETIQUETAS[segmento] ?? segmento)
      : ETIQUETAS[segmento];
    return { href, etiqueta, esUltimo };
  });

  return (
    <nav aria-label="Ruta de navegación" className="bg-surface border-b border-black/5">
      <div className="mx-auto max-w-6xl px-6 py-2 flex items-center gap-1.5 text-xs text-black/60">
        <Link href="/" className="hover:text-navy transition-colors">
          Inicio
        </Link>
        {items.map((item) => (
          <span key={item.href} className="flex items-center gap-1.5">
            <span className="text-black/30">/</span>
            {item.esUltimo || SIN_PAGINA_PROPIA.has(item.href) ? (
              <span
                className={item.esUltimo ? "text-navy font-medium" : undefined}
                aria-current={item.esUltimo ? "page" : undefined}
              >
                {item.etiqueta}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-navy transition-colors">
                {item.etiqueta}
              </Link>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
