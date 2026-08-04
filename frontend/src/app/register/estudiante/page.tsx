"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Label, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AuthLayout } from "@/components/ui/AuthLayout";
import { GraduationCapIcon } from "@/components/ui/icons";

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
    <AuthLayout
      icon={<GraduationCapIcon className="h-6 w-6" />}
      title="Encuentra tu próxima oportunidad profesional"
      subtitle="Prácticas, residencias y primer empleo, filtrados por tu carrera y cuatrimestre."
      bullets={[
        "Valida tu CV automáticamente en segundos",
        "Postúlate a vacantes con un clic",
        "Da seguimiento a cada postulación en un Kanban",
      ]}
    >
      <Card className="w-full max-w-md p-8 animate-fade-up">
        <h1 className="text-2xl font-semibold text-navy mb-1">Registro de estudiante</h1>
        <p className="text-sm text-black/60 mb-6">Usa tu correo institucional (@alumnos.upa.edu.mx).</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Correo institucional</Label>
            <Input
              type="email"
              required
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              placeholder="tucorreo@alumnos.upa.edu.mx"
            />
          </div>

          <div>
            <Label>Nombre completo</Label>
            <Input
              type="text"
              required
              minLength={3}
              value={form.nombreCompleto}
              onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
              placeholder="Como aparece en tu credencial"
            />
          </div>

          <div>
            <Label>Contraseña</Label>
            <Input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div>
            <Label>Matrícula</Label>
            <Input
              type="text"
              required
              value={form.matricula}
              onChange={(e) => setForm({ ...form, matricula: e.target.value })}
            />
          </div>

          <div>
            <Label>Carrera</Label>
            <Select
              value={form.carreraId}
              onChange={(e) => setForm({ ...form, carreraId: Number(e.target.value) })}
            >
              {CARRERAS.map((carrera) => (
                <option key={carrera.id} value={carrera.id}>
                  {carrera.nombre}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Cuatrimestre actual</Label>
            <Select
              value={form.cuatrimestre}
              onChange={(e) => setForm({ ...form, cuatrimestre: Number(e.target.value) })}
            >
              {Array.from({ length: 9 }, (_, i) => i + 1).map((c) => (
                <option key={c} value={c}>
                  {c}°
                </option>
              ))}
            </Select>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={enviando} className="w-full">
            {enviando ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
