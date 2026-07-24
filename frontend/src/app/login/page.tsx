"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login({ correo, password });
      router.push("/");
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-sm rounded-lg bg-white border border-black/10 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy mb-6">Iniciar sesión</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="correo" className="block text-sm font-medium mb-1">
              Correo
            </label>
            <input
              id="correo"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full rounded-md border border-black/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              placeholder="tucorreo@alumnos.upa.edu.mx"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-black/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-orange px-4 py-2 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {enviando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-sm text-black/60 text-center">
          ¿No tienes cuenta?{" "}
          <Link href="/register/estudiante" className="text-orange hover:underline">
            Regístrate como estudiante
          </Link>{" "}
          o{" "}
          <Link href="/register/empresa" className="text-orange hover:underline">
            como empresa
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
