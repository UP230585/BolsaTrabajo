"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "./NotificationBell";
import { buttonClasses } from "./ui/Button";

// Resalta el enlace de la página en la que está el usuario (indicador de
// "dónde estoy" pedido explícitamente para la evaluación).
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const activo = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`relative pb-1 transition-colors ${
        activo ? "text-orange font-semibold" : "hover:text-orange"
      }`}
    >
      {children}
      {activo && <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-orange rounded-full" />}
    </Link>
  );
}

export function Header() {
  const { usuario, logout } = useAuth();

  return (
    <header className="bg-navy text-white shadow-md relative z-10">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Bolsa de Trabajo UPA
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink href="/">Inicio</NavLink>
          <NavLink href="/jobs">Vacantes</NavLink>
          {usuario?.rol === "ESTUDIANTE" && (
            <>
              <NavLink href="/student/dashboard">Mi dashboard</NavLink>
              <NavLink href="/student/applications">Mis postulaciones</NavLink>
              <NavLink href="/chat">Mensajes</NavLink>
            </>
          )}
          {usuario?.rol === "EMPRESA" && (
            <>
              <NavLink href="/company/dashboard">Mi empresa</NavLink>
              <NavLink href="/company/profile">Mi perfil</NavLink>
              <NavLink href="/chat">Mensajes</NavLink>
            </>
          )}
          {usuario?.rol === "COORDINACION" && <NavLink href="/admin">Administración</NavLink>}
        </nav>

        {usuario ? (
          <div className="flex items-center gap-4 text-sm">
            <NotificationBell />
            <span className="hidden sm:inline">{usuario.correo}</span>
            <button onClick={logout} className={buttonClasses("primary", "md")}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          <Link href="/login" className={buttonClasses("primary", "md")}>
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}
