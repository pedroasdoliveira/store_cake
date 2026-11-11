import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmedOrder, loggedUser, redVelvet } from "../../test/fixtures";
import { renderWithProviders } from "../../test/render";
import { Carrinho } from "../Carrinho";
import { Historico } from ".";

vi.mock("../../api/client", () => ({
  api: {
    listOrders: vi.fn(),
    listProducts: vi.fn(),
  },
}));

import { api } from "../../api/client";

const missingItem = {
  productId: 99,
  productName: "Pistache",
  quantity: 1,
  unitPrice: 14,
  subtotal: 14,
};

function renderOrders() {
  return renderWithProviders(
    <Routes>
      <Route path="/historico" element={<Historico />} />
      <Route path="/carrinho" element={<Carrinho />} />
    </Routes>,
    { route: "/historico", user: loggedUser }
  );
}

describe("Historico", () => {
  beforeEach(() => {
    vi.mocked(api.listOrders).mockReset();
    vi.mocked(api.listProducts).mockReset();
  });

  it("orienta o visitante a entrar na conta", () => {
    renderWithProviders(<Historico />, { route: "/historico" });
    expect(screen.getByRole("heading", { name: "Meus pedidos" })).toBeInTheDocument();
    expect(screen.getByText("Entre na sua conta para consultar os pedidos.")).toBeInTheDocument();
  });

  it("lista os pedidos do cliente autenticado", async () => {
    vi.mocked(api.listOrders).mockResolvedValue([confirmedOrder]);
    renderWithProviders(<Historico />, { route: "/historico", user: loggedUser });

    expect(await screen.findByRole("heading", { name: "Pedido #42" })).toBeInTheDocument();
    expect(screen.getByText("2 cupcakes")).toBeInTheDocument();
    expect(screen.getByText("Seu pedido #42 foi recebido.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Detalhes" })).toHaveAttribute("href", "/historico/42");
    expect(api.listOrders).toHaveBeenCalledWith(loggedUser.userId);
  });

  it("não anuncia um pedido já entregue", async () => {
    vi.mocked(api.listOrders).mockResolvedValue([{ ...confirmedOrder, status: "DELIVERED" }]);
    renderWithProviders(<Historico />, { route: "/historico", user: loggedUser });

    expect(await screen.findByText("Entregue")).toBeInTheDocument();
    expect(screen.queryByText(/Seu pedido #42/)).not.toBeInTheDocument();
  });

  it("avisa quando nenhum item do pedido continua no cardápio", async () => {
    const user = userEvent.setup();
    vi.mocked(api.listOrders).mockResolvedValue([confirmedOrder]);
    vi.mocked(api.listProducts).mockResolvedValue([]);
    renderOrders();

    await user.click(await screen.findByRole("button", { name: "Pedir de novo" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Nenhum item deste pedido está no cardápio.");
    expect(screen.getByRole("heading", { name: "Pedido #42" })).toBeInTheDocument();
    expect(localStorage.getItem("cupcake-cart")).toBe("[]");
  });

  it("leva ao carrinho o que ainda existe e nomeia o que faltou", async () => {
    const user = userEvent.setup();
    vi.mocked(api.listOrders).mockResolvedValue([
      { ...confirmedOrder, items: [...confirmedOrder.items, missingItem] },
    ]);
    vi.mocked(api.listProducts).mockResolvedValue([redVelvet]);
    renderOrders();

    await user.click(await screen.findByRole("button", { name: "Pedir de novo" }));

    expect(await screen.findByRole("heading", { name: "Seu carrinho" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Estes itens não estão mais no cardápio: Pistache.");
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("não mexe no carrinho se o cardápio não responde", async () => {
    const user = userEvent.setup();
    vi.mocked(api.listOrders).mockResolvedValue([confirmedOrder]);
    vi.mocked(api.listProducts).mockRejectedValue(new Error("fora do ar"));
    renderOrders();

    await user.click(await screen.findByRole("button", { name: "Pedir de novo" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Não foi possível consultar o cardápio.");
    expect(screen.getByRole("heading", { name: "Pedido #42" })).toBeInTheDocument();
  });
});
