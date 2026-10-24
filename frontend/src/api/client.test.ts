import { afterEach, describe, expect, it, vi } from "vitest";
import { confirmedOrder, loggedUser, redVelvet } from "../test/fixtures";
import { api } from "./client";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

describe("api client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lista produtos na URL correta", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([redVelvet]));
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.listProducts()).resolves.toEqual([redVelvet]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/products",
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
  });

  it("filtra produtos por categoria", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([redVelvet]));
    vi.stubGlobal("fetch", fetchMock);

    await api.listProducts("Chocolate");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/products?category=Chocolate",
      expect.any(Object)
    );
  });

  it("envia login e devolve o usuário", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ ...loggedUser, message: "Login realizado com sucesso." })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await api.login({ email: "ana@loja.com", password: "senha123" });

    expect(result.userId).toBe(7);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "ana@loja.com", password: "senha123" }),
      })
    );
  });

  it("propaga a mensagem de erro da API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ message: "Já existe uma conta com este e-mail." }, 400))
    );

    await expect(
      api.register({ name: "Ana", email: "ana@loja.com", password: "senha123" })
    ).rejects.toThrow("Já existe uma conta com este e-mail.");
  });

  it("cria pedido e consulta histórico", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(confirmedOrder, 201))
      .mockResolvedValueOnce(jsonResponse([confirmedOrder]));
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.createOrder({ userId: 7, items: [] })).resolves.toEqual(confirmedOrder);
    await expect(api.listOrders(7)).resolves.toEqual([confirmedOrder]);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8080/api/orders",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, "http://localhost:8080/api/orders?userId=7", expect.any(Object));
  });
});
