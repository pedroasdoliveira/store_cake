import { describe, expect, it } from "vitest";
import { checkoutSummary, isCardComplete, isExpiryValid, isLuhnValid, maskCardNumber, maskZipCode } from "./checkout";

describe("checkout", () => {
  it("resume itens, entrega grátis e omite desconto quando não há", () => {
    expect(checkoutSummary(25.8)).toEqual({
      subtotal: 25.8,
      delivery: 0,
      discount: 0,
      total: 25.8,
    });
  });

  it("mascara CEP e número do cartão", () => {
    expect(maskZipCode("01001000")).toBe("01001-000");
    expect(maskCardNumber("4111111111111111")).toBe("4111 1111 1111 1111");
  });

  it("aceita o cartão de teste e recusa número inválido", () => {
    expect(isLuhnValid("4111111111111111")).toBe(true);
    expect(isLuhnValid("4111111111111112")).toBe(false);
    expect(
      isCardComplete(
        { number: "4111 1111 1111 1111", name: "Ana Cupcake", expiry: "12/30", cvv: "123" },
        new Date(2026, 10, 10)
      )
    ).toBe(true);
    expect(isExpiryValid("10/26", new Date(2026, 10, 10))).toBe(false);
  });
});
