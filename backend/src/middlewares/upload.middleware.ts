import multer from "multer";
import { AppError } from "./error.middleware";

const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

// Se usa almacenamiento en memoria (no en disco) porque el archivo se procesa
// inmediatamente: se analiza con pdf-parse y se sube a Azure Blob Storage (o
// se escribe en disco local). Guardarlo primero en disco sería un paso extra
// innecesario y no funcionaría bien en Azure App Service.
export const subirCv = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANO_MAXIMO_BYTES },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new AppError("Solo se aceptan archivos PDF", 400));
      return;
    }
    cb(null, true);
  },
}).single("cv");
