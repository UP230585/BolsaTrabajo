"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Usuario, LoginInput, RegistroEstudianteInput, RegistroEmpresaInput } from "@/types/auth";
import { getToken, setToken, clearToken } from "@/services/api";
import {
  loginRequest,
  registrarEstudianteRequest,
  registrarEmpresaRequest,
} from "@/services/auth.service";

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
}

type AuthAction =
  | { type: "SET_USUARIO"; usuario: Usuario | null }
  | { type: "SET_CARGANDO"; cargando: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USUARIO":
      return { ...state, usuario: action.usuario };
    case "SET_CARGANDO":
      return { ...state, cargando: action.cargando };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  login: (input: LoginInput) => Promise<void>;
  registrarEstudiante: (input: RegistroEstudianteInput) => Promise<void>;
  registrarEmpresa: (input: RegistroEmpresaInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, { usuario: null, cargando: true });
  const router = useRouter();

  // Al montar, si ya había un token guardado, se asume la sesión activa.
  // (En la Semana 2 se reemplaza por una llamada real a GET /auth/me).
  useEffect(() => {
    const token = getToken();
    dispatch({ type: "SET_CARGANDO", cargando: false });
    if (!token) {
      dispatch({ type: "SET_USUARIO", usuario: null });
    }
  }, []);

  async function login(input: LoginInput) {
    const { token, usuario } = await loginRequest(input);
    setToken(token);
    dispatch({ type: "SET_USUARIO", usuario });
  }

  async function registrarEstudiante(input: RegistroEstudianteInput) {
    const { token, usuario } = await registrarEstudianteRequest(input);
    setToken(token);
    dispatch({ type: "SET_USUARIO", usuario });
  }

  async function registrarEmpresa(input: RegistroEmpresaInput) {
    const { token, usuario } = await registrarEmpresaRequest(input);
    setToken(token);
    dispatch({ type: "SET_USUARIO", usuario });
  }

  function logout() {
    clearToken();
    dispatch({ type: "SET_USUARIO", usuario: null });
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{ ...state, login, registrarEstudiante, registrarEmpresa, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return context;
}
