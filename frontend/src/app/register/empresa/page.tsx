"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AuthLayout } from "@/components/ui/AuthLayout";
import { BriefcaseIcon } from "@/components/ui/icons";

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
    <AuthLayout
      icon={<BriefcaseIcon className="h-6 w-6" />}
      title="Encuentra el talento que tu empresa necesita"
      subtitle="Publica vacantes y recibe candidatos ya validados por la Coordinación de Vinculación."
      bullets={[
        "Publica una vacante en minutos",
        "Filtra por carrera y cuatrimestre automáticamente",
        "Chatea directo con tus candidatos",
      ]}
    >
      <Card className="w-full max-w-md p-8 animate-fade-up">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/10 text-navy">
            <BriefcaseIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-navy leading-tight">Registro de empresa</h1>
            <p className="text-sm text-black/60">Queda pendiente de aprobación por Coordinación.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Correo de contacto</Label>
            <Input
              type="email"
              required
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
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
            <Label>Razón social</Label>
            <Input
              type="text"
              required
              value={form.razonSocial}
              onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>RFC</Label>
              <Input
                type="text"
                required
                value={form.rfc}
                onChange={(e) => setForm({ ...form, rfc: e.target.value })}
              />
            </div>

            <div>
              <Label>Giro</Label>
              <Input
                type="text"
                required
                value={form.giro}
                onChange={(e) => setForm({ ...form, giro: e.target.value })}
                placeholder="Tecnología, manufactura..."
              />
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={enviando} className="w-full">
            {enviando ? "Enviando..." : "Registrar empresa"}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
