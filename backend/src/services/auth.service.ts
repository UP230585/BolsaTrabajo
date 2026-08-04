// Autenticación propia (JWT + bcrypt), sin proveedores externos.
// Los tres métodos devuelven { token, usuario } con la misma forma para
// que el frontend guarde la sesión igual sin importar el flujo de entrada.
import { userRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { AppError } from "../middlewares/error.middleware";
import type { RegistrarEstudianteDTO, RegistrarEmpresaDTO, LoginDTO } from "../dtos/auth.dto";

export const authService = {
  // Alta de estudiante: valida correo único, hashea la contraseña (nunca
  // se guarda en texto plano) y firma un JWT con el id y rol del usuario.
  async registrarEstudiante(datos: RegistrarEstudianteDTO) {
    const existente = await userRepository.findByEmail(datos.correo);
    if (existente) {
      throw new AppError("Ya existe una cuenta con ese correo", 409);
    }

    const passwordHash = await hashPassword(datos.password);
    const usuario = await userRepository.createEstudiante({
      correo: datos.correo,
      passwordHash,
      nombreCompleto: datos.nombreCompleto,
      matricula: datos.matricula,
      carreraId: datos.carreraId,
      cuatrimestre: datos.cuatrimestre,
    });

    const token = signToken({ userId: usuario.id, rol: usuario.rol });
    return { token, usuario: { id: usuario.id, correo: usuario.correo, rol: usuario.rol } };
  },

  // Alta de empresa: igual que el registro de estudiante, pero la cuenta
  // nace con aprobada = false hasta que la Coordinación la revise (ver
  // admin.service.aprobarEmpresa). La empresa puede iniciar sesión y crear
  // vacantes de inmediato, pero cada vacante nace sin aprobar y no es
  // visible para estudiantes hasta pasar su propia revisión.
  async registrarEmpresa(datos: RegistrarEmpresaDTO) {
    const existente = await userRepository.findByEmail(datos.correo);
    if (existente) {
      throw new AppError("Ya existe una cuenta con ese correo", 409);
    }

    const passwordHash = await hashPassword(datos.password);
    const usuario = await userRepository.createEmpresa({
      correo: datos.correo,
      passwordHash,
      razonSocial: datos.razonSocial,
      rfc: datos.rfc,
      giro: datos.giro,
    });

    const token = signToken({ userId: usuario.id, rol: usuario.rol });
    return { token, usuario: { id: usuario.id, correo: usuario.correo, rol: usuario.rol } };
  },

  // Login por correo + contraseña. Se devuelve el mismo mensaje genérico
  // tanto si el correo no existe como si la contraseña es incorrecta, para
  // no revelar a un atacante cuáles correos están registrados.
  async login(datos: LoginDTO) {
    const usuario = await userRepository.findByEmail(datos.correo);
    if (!usuario) {
      throw new AppError("Correo o contraseña incorrectos", 401);
    }

    const passwordValida = await comparePassword(datos.password, usuario.password);
    if (!passwordValida) {
      throw new AppError("Correo o contraseña incorrectos", 401);
    }

    if (!usuario.activo) {
      throw new AppError("Esta cuenta está desactivada", 403);
    }

    const token = signToken({ userId: usuario.id, rol: usuario.rol });
    return {
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
        estudiante: usuario.estudiante,
        empresa: usuario.empresa,
      },
    };
  },
};
