import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { cartItem, confirmedOrder, loggedUser } from "../test/fixtures";
import { renderWithProviders } from "../test/render";
import { Checkout } from "./Checkout";

vi.mock("../api/client", () => ({
  api: {
    createOrder: vi.fn(),
  },
}));

import { api } from "../api/client";

describe("Checkout", () => {
  it("pede login quando o usuário não está autenticado", () => {
    renderWithProviders(<Checkout />, { route: "/checkout", cart: [cartItem] });
    expect(screen.getByText("Faça login para finalizar o pedido.")).toBeInTheDocument();
  });

  it("envia o pedido e mostra a confirmação", async () => {
    const user = userEvent.setup();
    vi.mocked(api.createOrder).mockResolvedValue(confirmedOrder);

    renderWithProviders(<Checkout />, {
      route: "/checkout",
      user: loggedUser,
      cart: [cartItem],
    });

    await user.type(screen.getByLabelText("Rua"), "Rua das Flores");
    await user.type(screen.getByLabelText("Número"), "100");
    await user.type(screen.getByLabelText("Bairro"), "Centro");
    await user.type(screen.getByLabelText("Cidade"), "São Paulo");
    await user.clear(screen.getByLabelText("UF"));
    await user.type(screen.getByLabelText("UF"), "SP");
    await user.type(screen.getByLabelText("CEP"), "01000-000");
    await user.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(api.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 7,
        street: "Rua das Flores",
        paymentMethod: "PIX",
        items: [{ productId: 1, quantity: 2 }],
      })
    );
    expect(await screen.findByRole("heading", { name: "Pedido confirmado" })).toBeInTheDocument();
    expect(screen.getByText("#42")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Pedido #42 confirmado");
    expect(JSON.parse(localStorage.getItem("cupcake-cart") ?? "[]")).toEqual([]);
  });
});
