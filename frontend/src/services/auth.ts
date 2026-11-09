import { apiRequest } from "./api";

interface LoginResponse {
  access_token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    tipoUsuario: "ADMIN" | "USER";
    fotoUrl: string | null;
  };
}

export async function login(email: string, senha: string) {
  const data: LoginResponse = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      senha,
    }),
  });

  console.log("RESPOSTA DO LOGIN:", data);

  localStorage.setItem("token", data.access_token);
  localStorage.setItem("usuario", JSON.stringify(data.usuario));

  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("token"));
}