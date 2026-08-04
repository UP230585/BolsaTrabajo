"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// TODO (Semana 2): reemplazar por GET /api/v1/carreras cuando exista el endpoint.
// El orden coincide con el seed de prisma/seed.ts.
const CARRERAS = [
  { id: 1, nombre: "Ingeniería en Sistemas Computacionales (ISC)" },
  { id: 2, nombre: "Ing. en Tecnologías de la Información y Diseño de Interacción Digital (TIID)" },
  { id: 3, nombre: "Ingeniería Mecatrónica (MTR)" },
  { id: 4, nombre: "Ingeniería Aeronáutica (AEO)" },
  { id: 5, nombre: "Ingeniería Automotriz (AUT)" },
  { id: 6, nombre: "Ingeniería Biomédica (BIO)" },
  { id: 7, nombre: "Ingeniería Financiera (FIN)" },
  { id: 8, nombre: "Lic. en Administración y Gestión Empresarial (AGE)" },
  { id: 9, nombre: "Ingeniería en Energía (ENE)" },
];

export default function RegistroEstudiantePage() {
  const { registrarEstudiante } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    correo: "",
    password: "",
    nombreCompleto: "",
    matricula: "",
    carreraId: CARRERAS[0].id,
    cuatrimestre: 1,
  });
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await registrarEstudiante(form);
      router.push("/");
    } catch {
      setError("No se pudo completar el registro. Verifica tus datos o si el correo ya está registrado.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-md rounded-lg bg-white border border-black/10 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy mb-1">Registro de estudiante</h1>
        <p className="text-sm text-black/60 mb-6">Usa tu correo institucional (@alumnos.upa.edu.mx).</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Correo institucional</label>
            <input
              type="email"
              required
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              className="w-full rounded-md border border-black/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              placeholder="tucorreo@alumnos.upa.edu.mx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <input
              type="text"
              required
              minLength={3}
              value={form.nombreCompleto}
              onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
              className="w-full rounded-md border border-black/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
              placeholder="Como aparece en tu credencial"
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
            <label className="block text-sm font-medium mb-1">Matrícula</label>
            <input
              type="text"
              required
              value={form.matricula}
              onChange={(e) => setForm({ ...form, matricula: e.target.value })}
              className="w-full rounded-md border border-black/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Carrera</label>
            <select
              value={form.carreraId}
              onChange={(e) => setForm({ ...form, carreraId: Number(e.target.value) })}
              className="w-full rounded-md border border-black/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            >
              {CARRERAS.map((carrera) => (
                <option key={carrera.id} value={carrera.id}>
                  {carrera.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cuatrimestre actual</label>
            <select
              value={form.cuatrimestre}
              onChange={(e) => setForm({ ...form, cuatrimestre: Number(e.target.value) })}
              className="w-full rounded-md border border-black/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            >
              {Array.from({ length: 9 }, (_, i) => i + 1).map((c) => (
                <option key={c} value={c}>
                  {c}°
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-orange px-4 py-2 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {enviando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
