import type { AuthUser, Order, Product } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? "Não foi possível concluir a operação.");
  }
  return data as T;
}

export const api = {
  listProducts: (category?: string) => {
    const query = category && category !== "todos" ? `?category=${encodeURIComponent(category)}` : "";
    return request<Product[]>(`/api/products${query}`);
  },
  register: (payload: { name: string; email: string; password: string }) =>
    request<AuthUser & { message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<AuthUser & { message: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createOrder: (payload: unknown) =>
    request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listOrders: (userId: number) => request<Order[]>(`/api/orders?userId=${userId}`),
};
