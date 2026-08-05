"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "./NotificationBell";
import { buttonClasses } from "./ui/Button";
import { MenuIcon, XCircleIcon } from "./ui/icons";

// Resalta el enlace de la página en la que está el usuario (indicador de
// "dónde estoy" pedido explícitamente para la evaluación).
function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const pathname = usePathname();
  const activo = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
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
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cada enlace/botón del menú móvil recibe onClick={() => setMenuAbierto(false)}
  // para cerrarse al navegar, sin necesitar un efecto que vigile la ruta.
  const enlaces = (onClick?: () => void) => (
    <>
      <NavLink href="/" onClick={onClick}>Inicio</NavLink>
      <NavLink href="/jobs" onClick={onClick}>Vacantes</NavLink>
      {usuario?.rol === "ESTUDIANTE" && (
        <>
          <NavLink href="/student/dashboard" onClick={onClick}>Mi dashboard</NavLink>
          <NavLink href="/student/applications" onClick={onClick}>Mis postulaciones</NavLink>
          <NavLink href="/student/saved" onClick={onClick}>Guardadas</NavLink>
          <NavLink href="/chat" onClick={onClick}>Mensajes</NavLink>
        </>
      )}
      {usuario?.rol === "EMPRESA" && (
        <>
          <NavLink href="/company/dashboard" onClick={onClick}>Mi empresa</NavLink>
          <NavLink href="/company/profile" onClick={onClick}>Mi perfil</NavLink>
          <NavLink href="/chat" onClick={onClick}>Mensajes</NavLink>
        </>
      )}
      {usuario?.rol === "COORDINACION" && <NavLink href="/admin" onClick={onClick}>Administración</NavLink>}
    </>
  );

  return (
    <header className="bg-navy text-white shadow-md relative z-10">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Bolsa de Trabajo UPA
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">{enlaces()}</nav>

        <div className="flex items-center gap-3 sm:gap-4 text-sm">
          {usuario && <NotificationBell />}
          {usuario ? (
            <>
              <span className="hidden sm:inline">{usuario.correo}</span>
              <button onClick={logout} className={`hidden md:inline-flex ${buttonClasses("primary", "md")}`}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link href="/login" className={`hidden md:inline-flex ${buttonClasses("primary", "md")}`}>
              Iniciar sesión
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
            className="md:hidden p-1"
          >
            {menuAbierto ? <XCircleIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuAbierto && (
        <nav className="md:hidden flex flex-col gap-4 px-6 pb-5 pt-1 text-sm border-t border-white/10">
          {enlaces(() => setMenuAbierto(false))}
          {usuario ? (
            <>
              <span className="text-white/70">{usuario.correo}</span>
              <button onClick={logout} className={buttonClasses("primary", "md")}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link href="/login" className={buttonClasses("primary", "md")} onClick={() => setMenuAbierto(false)}>
              Iniciar sesión
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
