"use client";

import { useEffect, useState } from "react";
import { Semaforo } from "@/components/Semaforo";
import { miPerfilRequest, actualizarCvRequest } from "@/services/students.service";
import type { PerfilEstudiante, ActualizarCvInput } from "@/types/students";

type CampoBooleano = Exclude<keyof ActualizarCvInput, "archivoUrl">;

const CAMPOS: { key: CampoBooleano; label: string }[] = [
  { key: "datosPersonales", label: "Datos personales" },
  { key: "formacionAcademica", label: "Formación académica" },
  { key: "experienciaLaboral", label: "Experiencia laboral" },
  { key: "habilidadesTecnicas", label: "Habilidades técnicas" },
  { key: "idiomas", label: "Idiomas" },
  { key: "fotoPerfil", label: "Foto de perfil" },
];

export default function StudentProfilePage() {
  const [perfil, setPerfil] = useState<PerfilEstudiante | null>(null);
  const [form, setForm] = useState<ActualizarCvInput>({
    archivoUrl: "",
    datosPersonales: false,
    formacionAcademica: false,
    experienciaLaboral: false,
    habilidadesTecnicas: false,
    idiomas: false,
    fotoPerfil: false,
  });
  const [porcentaje, setPorcentaje] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    miPerfilRequest()
      .then((data) => {
        setPerfil(data);
        setPorcentaje(data.porcentajeCV);
        if (data.cv) {
          setForm({
            archivoUrl: data.cv.archivoUrl,
            datosPersonales: data.cv.datosPersonales,
            formacionAcademica: data.cv.formacionAcademica,
            experienciaLaboral: data.cv.experienciaLaboral,
            habilidadesTecnicas: data.cv.habilidadesTecnicas,
            idiomas: data.cv.idiomas,
            fotoPerfil: data.cv.fotoPerfil,
          });
        }
      })
      .finally(() => setCargando(false));
  }, []);

  async function handleGuardar() {
    setGuardando(true);
    try {
      const cv = await actualizarCvRequest({
        ...form,
        archivoUrl: form.archivoUrl || "pendiente-de-subir.pdf",
      });
      setPorcentaje(cv.porcentaje);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return <p className="text-center py-16 text-black/60">Cargando tu perfil...</p>;
  }

  if (!perfil) {
    return <p className="text-center py-16 text-black/60">No se pudo cargar tu perfil.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy mb-1">Validador de CV</h1>
      <p className="text-black/60 mb-8">
        Marca las secciones que ya completaste. El sistema calcula tu semáforo automáticamente.
      </p>

      <div className="rounded-lg border border-black/10 bg-white p-8 flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center gap-2">
          <Semaforo porcentaje={porcentaje} />
          <p className="text-xs text-black/60 text-center max-w-[10rem]">
            {porcentaje >= 100
              ? "CV verificado"
              : porcentaje >= 50
                ? "Casi listo, agrega lo que falta"
                : "Faltan varias secciones"}
          </p>
        </div>

        <div className="flex-1 space-y-3">
          {CAMPOS.map((campo) => (
            <label key={campo.key} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form[campo.key]}
                onChange={(e) => setForm({ ...form, [campo.key]: e.target.checked })}
                className="w-4 h-4 accent-orange"
              />
              {campo.label}
            </label>
          ))}

          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="mt-4 rounded-md bg-orange px-5 py-2 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
