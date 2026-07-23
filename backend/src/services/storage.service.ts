/**
 * Almacenamiento de archivos (CVs).
 *
 * Tiene dos modos y elige automáticamente según las variables de entorno:
 *
 *  - AZURE (producción): si existe AZURE_STORAGE_CONNECTION_STRING, sube el
 *    archivo a Azure Blob Storage. Necesario porque Azure App Service borra el
 *    disco del contenedor en cada despliegue, así que un archivo guardado en
 *    disco desaparecería.
 *
 *  - DISCO (desarrollo local): si no hay cadena de conexión, guarda en
 *    backend/uploads/cv. Así el equipo puede trabajar sin cuenta de Azure.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env";

const CARPETA_LOCAL = path.resolve(process.cwd(), "uploads", "cv");

export interface ArchivoGuardado {
  /** URL con la que el frontend puede mostrar el archivo. */
  url: string;
  /** Dónde quedó guardado realmente (para diagnóstico). */
  almacenamiento: "azure-blob" | "disco-local";
}

export const storageService = {
  usaAzure(): boolean {
    return Boolean(env.azureStorageConnectionString);
  },

  async guardarCv(nombreArchivo: string, contenido: Buffer): Promise<ArchivoGuardado> {
    if (this.usaAzure()) {
      return this.guardarEnAzure(nombreArchivo, contenido);
    }
    return this.guardarEnDisco(nombreArchivo, contenido);
  },

  async guardarEnAzure(nombreArchivo: string, contenido: Buffer): Promise<ArchivoGuardado> {
    const { BlobServiceClient } = await import("@azure/storage-blob");

    const blobService = BlobServiceClient.fromConnectionString(
      env.azureStorageConnectionString!
    );
    const contenedor = blobService.getContainerClient(env.azureStorageContainer);

    // Crea el contenedor si no existe. "blob" permite leer los archivos por URL
    // directa (necesario para la vista previa del CV) sin exponer la lista
    // completa de archivos del contenedor.
    await contenedor.createIfNotExists({ access: "blob" });

    const blob = contenedor.getBlockBlobClient(nombreArchivo);
    await blob.uploadData(contenido, {
      blobHTTPHeaders: { blobContentType: "application/pdf" },
    });

    return { url: blob.url, almacenamiento: "azure-blob" };
  },

  async guardarEnDisco(nombreArchivo: string, contenido: Buffer): Promise<ArchivoGuardado> {
    await fs.mkdir(CARPETA_LOCAL, { recursive: true });
    await fs.writeFile(path.join(CARPETA_LOCAL, nombreArchivo), contenido);
    return { url: `/uploads/cv/${nombreArchivo}`, almacenamiento: "disco-local" };
  },
};
