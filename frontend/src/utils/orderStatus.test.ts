import { describe, expect, it } from "vitest";
import { customerOrderStatusLabel, orderStatusLabel, trackingMessage } from "./orderStatus";

describe("orderStatusLabel", () => {
  it("traduz os status conhecidos", () => {
    expect(orderStatusLabel("OUT_FOR_DELIVERY")).toBe("Saiu para entrega");
  });

  it("mantém um status desconhecido visível", () => {
    expect(orderStatusLabel("CUSTOM")).toBe("CUSTOM");
  });

  it("mostra o pedido recebido para o cliente e confirmado para o painel", () => {
    expect(customerOrderStatusLabel("CONFIRMED")).toBe("Pedido recebido");
    expect(orderStatusLabel("CONFIRMED")).toBe("Confirmado");
    expect(trackingMessage({ id: 42, status: "OUT_FOR_DELIVERY" })).toBe(
      "Seu pedido #42 saiu para entrega."
    );
    expect(trackingMessage({ id: 42, status: "DELIVERED" })).toBeNull();
  });
});
