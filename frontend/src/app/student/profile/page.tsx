"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { Semaforo } from "@/components/Semaforo";
import { miPerfilRequest, analizarCvRequest } from "@/services/students.service";
import type { PerfilEstudiante, DetalleAnalisisCv } from "@/types/students";
import { Card } from "@/components/ui/Card";
import { PageLoading } from "@/components/ui/PageState";
import { CheckCircleIcon, XCircleIcon, UploadCloudIcon, FileTextIcon } from "@/components/ui/icons";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
// La URL del CV puede venir de dos formas segun donde este guardado:
//  - Azure Blob Storage: URL absoluta (https://...blob.core.windows.net/...)
//  - Disco local: ruta relativa (/uploads/cv/...) servida por el backend
const SERVIDOR_ARCHIVOS = API_BASE.replace(/\/api\/v1\/?$/, "");

function urlCompletaDelCv(archivoUrl: string): string {
  return archivoUrl.startsWith("http") ? archivoUrl : `${SERVIDOR_ARCHIVOS}${archivoUrl}`;
}

// Secciones mostradas cuando aún no se ha analizado ningún CV.
const SECCIONES_BASE = [
  "Datos personales",
  "Formación académica",
  "Experiencia laboral",
  "Habilidades técnicas",
  "Idiomas",
  "Foto de perfil",
];

export default function StudentProfilePage() {
  const [perfil, setPerfil] = useState<PerfilEstudiante | null>(null);
  const [porcentaje, setPorcentaje] = useState(0);
  const [detalles, setDetalles] = useState<DetalleAnalisisCv[]>([]);
  const [archivoUrl, setArchivoUrl] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [analizando, setAnalizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    miPerfilRequest()
      .then((data) => {
        setPerfil(data);
        setPorcentaje(data.porcentajeCV);
        if (data.cv) {
          setArchivoUrl(data.cv.archivoUrl);
          // Reconstruye el checklist a partir de lo guardado en la BD.
          setDetalles([
            { seccion: "Datos personales", encontrado: data.cv.datosPersonales, evidencia: null },
            { seccion: "Formación académica", encontrado: data.cv.formacionAcademica, evidencia: null },
            { seccion: "Experiencia laboral", encontrado: data.cv.experienciaLaboral, evidencia: null },
            { seccion: "Habilidades técnicas", encontrado: data.cv.habilidadesTecnicas, evidencia: null },
            { seccion: "Idiomas", encontrado: data.cv.idiomas, evidencia: null },
            { seccion: "Foto de perfil", encontrado: data.cv.fotoPerfil, evidencia: null },
          ]);
        }
      })
      .finally(() => setCargando(false));
  }, []);

  async function procesarArchivo(archivo: File) {
    setError(null);

    if (archivo.type !== "application/pdf") {
      setError("Solo se aceptan archivos PDF.");
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setError("El archivo supera el tamaño máximo permitido (5 MB).");
      return;
    }

    setNombreArchivo(archivo.name);
    setAnalizando(true);
    try {
      const resultado = await analizarCvRequest(archivo);
      setPorcentaje(resultado.porcentaje);
      setDetalles(resultado.detalles);
      setArchivoUrl(resultado.archivoUrl);
    } catch {
      setError("No se pudo analizar el PDF. Verifica que no esté dañado ni protegido con contraseña.");
    } finally {
      setAnalizando(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setArrastrando(false);
    const archivo = event.dataTransfer.files?.[0];
    if (archivo) void procesarArchivo(archivo);
  }

  if (cargando) {
    return <PageLoading label="Cargando tu perfil..." />;
  }

  if (!perfil) {
    return <PageLoading label="No se pudo cargar tu perfil." />;
  }

  const listaMostrada: DetalleAnalisisCv[] =
    detalles.length > 0
      ? detalles
      : SECCIONES_BASE.map((seccion) => ({ seccion, encontrado: false, evidencia: null }));

  return (
    <div className="mx-auto max-w-6xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy mb-1">Validador de CV</h1>
      <p className="text-black/60 mb-8">
        Sube tu CV en PDF y el sistema detectará automáticamente qué secciones incluye.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda: subida y vista previa */}
        <Card className="p-6 shadow-sm">
          <h2 className="font-semibold text-navy mb-4">Tu CV</h2>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all ${
              arrastrando ? "border-orange bg-orange/5 scale-[1.01]" : "border-black/20 hover:border-navy hover:bg-surface/50"
            }`}
          >
            <UploadCloudIcon
              className={`h-9 w-9 mx-auto mb-3 transition-colors ${arrastrando ? "text-orange" : "text-black/30"}`}
            />
            <p className="text-sm text-black/70">
              {analizando ? `Analizando ${nombreArchivo ?? "tu CV"}...` : "Arrastra tu CV aquí o haz clic para elegir un archivo"}
            </p>
            <p className="text-xs text-black/40 mt-1">Solo PDF, máximo 5 MB</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) void procesarArchivo(archivo);
            }}
          />

          {error && <p className="mt-3 text-sm text-danger">{error}</p>}

          {archivoUrl && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2 text-xs text-black/50">
                <FileTextIcon className="h-4 w-4" />
                <span className="truncate">{nombreArchivo ?? "Vista previa"}</span>
              </div>
              <iframe
                src={urlCompletaDelCv(archivoUrl)}
                title="Vista previa del CV"
                className="w-full h-72 rounded-lg border border-black/10"
              />
            </div>
          )}
        </Card>

        {/* Columna derecha: resultado del análisis */}
        <Card className="p-6 shadow-sm">
          <h2 className="font-semibold text-navy mb-4">Análisis automático</h2>

          <div className="flex flex-col items-center gap-2 mb-6">
            <Semaforo porcentaje={porcentaje} />
            <p className="text-xs text-black/60 text-center max-w-[14rem]">
              {porcentaje >= 100
                ? "Tu CV está completo y verificado."
                : porcentaje >= 50
                  ? "Tu CV va bien, pero le falta información."
                  : "Tu CV no está listo para publicarse."}
            </p>
          </div>

          <ul className="space-y-1.5">
            {listaMostrada.map((d) => (
              <li
                key={d.seccion}
                className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 ${
                  d.encontrado ? "bg-success/5" : "bg-danger/5"
                }`}
              >
                {d.encontrado ? (
                  <CheckCircleIcon className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                ) : (
                  <XCircleIcon className="h-4 w-4 mt-0.5 shrink-0 text-danger" />
                )}
                <span className="flex-1">
                  {d.seccion}
                  {d.evidencia && (
                    <span className="block text-xs text-black/40">detectado por: {d.evidencia}</span>
                  )}
                  {!d.encontrado && (
                    <span className="block text-xs text-black/40">
                      Agrega esta sección a tu CV y vuelve a subirlo
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {porcentaje >= 100 && (
            <p className="mt-6 rounded-md bg-success/10 text-success text-sm px-4 py-3">
              ¡Listo! Tu perfil ya puede ser visto por las empresas.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
