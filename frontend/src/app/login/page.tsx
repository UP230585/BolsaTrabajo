"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AuthLayout } from "@/components/ui/AuthLayout";
import { LockIcon } from "@/components/ui/icons";

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
    <AuthLayout
      icon={<LockIcon className="h-6 w-6" />}
      title="Un solo lugar para tu vida profesional en la UPA"
      subtitle="Estudiantes y empresas coordinados por la Universidad Politécnica de Aguascalientes."
      bullets={[
        "Vacantes filtradas por tu carrera y cuatrimestre",
        "Postulaciones y contacto con empresas en un solo panel",
        "Todo validado por la Coordinación de Vinculación",
      ]}
    >
      <Card className="w-full max-w-sm p-8 animate-fade-up">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/10 text-navy">
            <LockIcon className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold text-navy">Iniciar sesión</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="correo">Correo</Label>
            <Input
              id="correo"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@alumnos.upa.edu.mx"
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={enviando} className="w-full">
            {enviando ? "Ingresando..." : "Ingresar"}
          </Button>
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
      </Card>
    </AuthLayout>
  );
}
