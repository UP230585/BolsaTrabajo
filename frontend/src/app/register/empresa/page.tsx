"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegistroEmpresaPage() {
  const { registrarEmpresa } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    correo: "",
    password: "",
    razonSocial: "",
    rfc: "",
    giro: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await registrarEmpresa(form);
      router.push("/");
    } catch {
      setError("No se pudo completar el registro. Verifica tus datos o si el correo/RFC ya está registrado.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-md rounded-lg bg-white border border-black/10 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy mb-1">Registro de empresa</h1>
        <p className="text-sm text-black/60 mb-6">
          Tu cuenta quedará pendiente de aprobación por la Coordinación de Vinculación.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Correo de contacto</label>
            <input
              type="email"
              required
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              className="w-full rounded-md border border-black/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-md border border-black/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Razón social</label>
            <input
              type="text"
              required
              value={form.razonSocial}
              onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
              className="w-full rounded-md border border-black/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">RFC</label>
            <input
              type="text"
              required
              value={form.rfc}
              onChange={(e) => setForm({ ...form, rfc: e.target.value })}
              className="w-full rounded-md border border-black/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Giro</label>
            <input
              type="text"
              required
              value={form.giro}
              onChange={(e) => setForm({ ...form, giro: e.target.value })}
              className="w-full rounded-md border border-black/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              placeholder="Tecnología, manufactura, servicios..."
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-orange px-4 py-2 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Registrar empresa"}
          </button>
        </form>
      </div>
    </div>
  );
}
