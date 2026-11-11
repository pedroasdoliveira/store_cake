import { describe, expect, it } from "vitest";
import { PIX_TIMEOUT_SECONDS, buildPixPayload, crc16Ccitt, formatClock } from "./pix";

describe("pix", () => {
  it("formata o prazo de 15 minutos", () => {
    expect(PIX_TIMEOUT_SECONDS).toBe(15 * 60);
    expect(formatClock(PIX_TIMEOUT_SECONDS)).toBe("15:00");
    expect(formatClock(0)).toBe("00:00");
  });

  it("monta um código PIX com CRC válido", () => {
    expect(crc16Ccitt("123456789")).toBe("29B1");
    const payload = buildPixPayload({ amount: 25.8, city: "São Paulo", txid: "PED42" });
    expect(payload).toContain("br.gov.bcb.pix");
    expect(payload).toContain("SAO PAULO");
    expect(payload).toContain("25.80");
    expect(payload.slice(-4)).toBe(crc16Ccitt(payload.slice(0, -4)));
  });
});
