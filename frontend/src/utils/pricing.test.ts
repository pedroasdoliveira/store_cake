import { describe, expect, it } from "vitest";
import { chargedPrice } from "./pricing";

describe("chargedPrice", () => {
  it("usa o preço de vitrine quando não há promoção no produto", () => {
    expect(chargedPrice({ price: 12.9 })).toBe(12.9);
  });

  it("usa o preço com desconto calculado pela API", () => {
    expect(chargedPrice({ price: 12.9, salePrice: 11.61 })).toBe(11.61);
  });
});
