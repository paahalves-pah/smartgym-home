import { apiRequest } from "./api";

interface LoginResponse {
  access_token: string;
  user?: {
    id: number;
    nome: string;
    email: string;
    role?: string;
  };
}

export async function login(email: string, senha: string) {
  const data: LoginResponse = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });

  localStorage.setItem("token", data.access_token);

  if (data.user) {
    localStorage.setItem("usuario", JSON.stringify(data.user));
  }

  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("token"));
}