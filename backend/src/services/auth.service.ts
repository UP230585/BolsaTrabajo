import { userRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { AppError } from "../middlewares/error.middleware";
import type { RegistrarEstudianteDTO, RegistrarEmpresaDTO, LoginDTO } from "../dtos/auth.dto";

export const authService = {
  async registrarEstudiante(datos: RegistrarEstudianteDTO) {
    const existente = await userRepository.findByEmail(datos.correo);
    if (existente) {
      throw new AppError("Ya existe una cuenta con ese correo", 409);
    }

    const passwordHash = await hashPassword(datos.password);
    const usuario = await userRepository.createEstudiante({
      correo: datos.correo,
      passwordHash,
      matricula: datos.matricula,
      carreraId: datos.carreraId,
      cuatrimestre: datos.cuatrimestre,
    });

    const token = signToken({ userId: usuario.id, rol: usuario.rol });
    return { token, usuario: { id: usuario.id, correo: usuario.correo, rol: usuario.rol } };
  },

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
