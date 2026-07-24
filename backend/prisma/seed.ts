/**
 * Seed de datos de prueba — Épica 2 (Base de datos), feature/database-seed
 * Ejecutar con: npm run seed
 */
import { PrismaClient, Rol, Modalidad } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CARRERAS_UPA = [
  { nombre: "Ingeniería en Sistemas Computacionales", clave: "ISC" },
  { nombre: "Ingeniería en Tecnologías de la Información y Diseño de Interacción Digital", clave: "TIID" },
  { nombre: "Ingeniería Mecatrónica", clave: "MTR" },
  { nombre: "Ingeniería Aeronáutica", clave: "AEO" },
  { nombre: "Ingeniería Automotriz", clave: "AUT" },
  { nombre: "Ingeniería Biomédica", clave: "BIO" },
  { nombre: "Ingeniería Financiera", clave: "FIN" },
  { nombre: "Licenciatura en Administración y Gestión Empresarial", clave: "AGE" },
  { nombre: "Ingeniería en Energía", clave: "ENE" },
];

const INSIGNIAS = [
  { nombre: "Perfil Completo", descripcion: "Completaste el 100% de tu perfil", icono: "badge-check" },
  { nombre: "CV Verificado", descripcion: "Tu CV pasó la validación automática", icono: "file-check" },
  { nombre: "Primer Postulante", descripcion: "Hiciste tu primera postulación", icono: "send" },
  { nombre: "Entrevista Conseguida", descripcion: "Llegaste a la etapa de entrevista", icono: "users" },
];

async function main() {
  console.log("Sembrando carreras...");
  for (const carrera of CARRERAS_UPA) {
    await prisma.carrera.upsert({
      where: { clave: carrera.clave },
      update: {},
      create: carrera,
    });
  }

  console.log("Sembrando insignias...");
  for (const insignia of INSIGNIAS) {
    const existente = await prisma.insignia.findFirst({ where: { nombre: insignia.nombre } });
    if (!existente) {
      await prisma.insignia.create({ data: insignia });
    }
  }

  console.log("Sembrando usuario de Coordinación...");
  const passwordCoordinacion = await bcrypt.hash("Coordinacion#2026", 10);
  await prisma.usuario.upsert({
    where: { correo: "coordinacion@upa.edu.mx" },
    update: {},
    create: {
      correo: "coordinacion@upa.edu.mx",
      password: passwordCoordinacion,
      rol: Rol.COORDINACION,
    },
  });

  console.log("Sembrando empresa de ejemplo...");
  const passwordEmpresa = await bcrypt.hash("Empresa#2026", 10);
  const usuarioEmpresa = await prisma.usuario.upsert({
    where: { correo: "rh@empresa-demo.com" },
    update: {},
    create: {
      correo: "rh@empresa-demo.com",
      password: passwordEmpresa,
      rol: Rol.EMPRESA,
    },
  });

  const empresaDemo = await prisma.empresa.upsert({
    where: { usuarioId: usuarioEmpresa.id },
    update: {},
    create: {
      usuarioId: usuarioEmpresa.id,
      razonSocial: "Empresa Demo S.A. de C.V.",
      rfc: "EDE260101ABC",
      giro: "Tecnología",
      aprobada: true,
    },
  });

  const carreraISC = await prisma.carrera.findUniqueOrThrow({ where: { clave: "ISC" } });

  console.log("Sembrando vacante de ejemplo...");
  await prisma.vacante.upsert({
    where: { id: 1 },
    update: {},
    create: {
      titulo: "Desarrollador Web Junior",
      descripcion: "Vacante de prácticas profesionales para el desarrollo de aplicaciones web con React y Node.js.",
      empresaId: empresaDemo.id,
      carreraId: carreraISC.id,
      cuatrimestreMin: 7,
      modalidad: Modalidad.HIBRIDO,
      salario: 8000,
      activa: true,
      aprobada: true,
    },
  });

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
