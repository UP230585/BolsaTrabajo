"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { usuario, logout } = useAuth();

  return (
    <header className="bg-navy text-white">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Bolsa de Trabajo UPA
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-orange transition-colors">
            Inicio
          </Link>
          <Link href="/jobs" className="hover:text-orange transition-colors">
            Vacantes
          </Link>
          <Link href="/empresas" className="hover:text-orange transition-colors">
            Empresas
          </Link>
        </nav>

        {usuario ? (
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline">{usuario.correo}</span>
            <button
              onClick={logout}
              className="rounded-md bg-orange px-4 py-2 font-medium hover:opacity-90 transition-opacity"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-orange px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}
