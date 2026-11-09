const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    headers: {
      ...(isFormData
        ? {}
        : { "Content-Type": "application/json" }),

      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),

      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.message || "Erro ao conectar com o servidor."
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}