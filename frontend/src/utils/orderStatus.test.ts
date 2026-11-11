import { describe, expect, it } from "vitest";
import { orderStatusLabel } from "./orderStatus";

describe("orderStatusLabel", () => {
  it("traduz os status conhecidos", () => {
    expect(orderStatusLabel("OUT_FOR_DELIVERY")).toBe("Saiu para entrega");
  });

  it("mantém um status desconhecido visível", () => {
    expect(orderStatusLabel("CUSTOM")).toBe("CUSTOM");
  });
});
