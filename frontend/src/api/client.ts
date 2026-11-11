import type { AuthUser, Order, Product, ZipCodeAddress } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? "Não foi possível concluir a operação.");
  }
  return data as T;
}

interface ViaCepResponse {
  erro?: boolean;
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

function formatZipCode(digits: string) {
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
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
  registerAdmin: (payload: { adminUserId: number; name: string; email: string; password: string }) =>
    request<AuthUser & { message: string }>("/api/auth/admins", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createOrder: (payload: unknown) =>
    request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listOrders: (userId: number) => request<Order[]>(`/api/orders?userId=${userId}`),
  lookupZipCode: async (zipCode: string): Promise<ZipCodeAddress> => {
    const digits = zipCode.replace(/\D/g, "");
    if (digits.length !== 8) {
      throw new Error("Informe um CEP com 8 dígitos.");
    }

    let response: Response;
    try {
      response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    } catch {
      throw new Error("Não foi possível consultar o CEP.");
    }

    if (!response.ok) {
      throw new Error("Não foi possível consultar o CEP.");
    }

    const body = (await response.json().catch(() => null)) as ViaCepResponse | null;
    if (!body) {
      throw new Error("Não foi possível consultar o CEP.");
    }
    if (body.erro || !body.localidade || !body.uf) {
      throw new Error("CEP não encontrado.");
    }

    return {
      street: body.logradouro ?? "",
      neighborhood: body.bairro ?? "",
      city: body.localidade,
      state: body.uf.toUpperCase(),
      zipCode: body.cep && body.cep.includes("-") ? body.cep : formatZipCode(digits),
    };
  },
};
