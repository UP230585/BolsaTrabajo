import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Exportación estática: Azure Static Web Apps sirve archivos estáticos,
  // no ejecuta código de servidor. Como todo el frontend ya es "use client"
  // (consume la API por Axios, no usa Server Components ni Route Handlers),
  // esto genera HTML/JS puro en la carpeta out/ sin perder funcionalidad.
  output: "export",
};

export default nextConfig;
