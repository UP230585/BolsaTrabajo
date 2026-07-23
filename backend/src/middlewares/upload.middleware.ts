import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { AppError } from "./error.middleware";

const CARPETA_CV = path.resolve(process.cwd(), "uploads", "cv");
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

// Se asegura de que la carpeta exista al arrancar (en Azure el contenedor
// empieza limpio en cada despliegue).
fs.mkdirSync(CARPETA_CV, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, CARPETA_CV),
  filename: (req, file, cb) => {
    // Nombre predecible por usuario: evita acumular un archivo por cada
    // intento de subida y no expone el nombre original del archivo.
    const userId = req.usuario?.userId ?? "anonimo";
    const extension = path.extname(file.originalname).toLowerCase() || ".pdf";
    cb(null, `cv-${userId}${extension}`);
  },
});

export const subirCv = multer({
  storage,
  limits: { fileSize: TAMANO_MAXIMO_BYTES },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new AppError("Solo se aceptan archivos PDF", 400));
      return;
    }
    cb(null, true);
  },
}).single("cv");
