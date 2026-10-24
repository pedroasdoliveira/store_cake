import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { confirmedOrder, loggedUser } from "../test/fixtures";
import { renderWithProviders } from "../test/render";
import { Historico } from "./Historico";

vi.mock("../api/client", () => ({
  api: {
    listOrders: vi.fn(),
  },
}));

import { api } from "../api/client";

describe("Historico", () => {
  it("orienta o visitante a entrar na conta", () => {
    renderWithProviders(<Historico />, { route: "/historico" });
    expect(screen.getByText("Entre na sua conta para consultar os pedidos.")).toBeInTheDocument();
  });

  it("lista os pedidos do cliente autenticado", async () => {
    vi.mocked(api.listOrders).mockResolvedValue([confirmedOrder]);
    renderWithProviders(<Historico />, { route: "/historico", user: loggedUser });

    expect(await screen.findByRole("heading", { name: "Pedido #42" })).toBeInTheDocument();
    expect(screen.getByText("2x Red Velvet — R$ 25,80")).toBeInTheDocument();
    expect(api.listOrders).toHaveBeenCalledWith(7);
  });
});
