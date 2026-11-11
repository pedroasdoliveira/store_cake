import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { confirmedOrder } from "../../test/fixtures";
import { PixPayment } from ".";

describe("PixPayment", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("expira o QR Code após 15 minutos e permite gerar outro", async () => {
    vi.useFakeTimers();
    render(<PixPayment order={confirmedOrder} amount={25.8} onOpenHistory={vi.fn()} />);

    expect(screen.getByRole("timer")).toHaveTextContent("15:00");

    await act(async () => {
      vi.advanceTimersByTime(15 * 60 * 1000);
    });

    expect(screen.getByRole("timer")).toHaveTextContent("O tempo para pagamento deste código expirou.");
    expect(screen.getByRole("button", { name: "Gerar novo código" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar código PIX" })).toBeDisabled();
  });
});
