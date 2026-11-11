import { act, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { confirmedOrder, loggedUser } from "../../test/fixtures";
import type { AuthUser } from "../../types";
import { renderWithProviders } from "../../test/render";
import { Pedido } from ".";

vi.mock("../../api/client", () => ({
  api: {
    listOrders: vi.fn(),
  },
}));

import { api } from "../../api/client";

function renderPedido(route: string, user: AuthUser | null = loggedUser) {
  return renderWithProviders(
    <Routes>
      <Route path="/historico/:id" element={<Pedido />} />
    </Routes>,
    { route, user }
  );
}

describe("Pedido", () => {
  beforeEach(() => {
    vi.mocked(api.listOrders).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("não consulta a API sem sessão", () => {
    renderPedido("/historico/42", null);

    expect(screen.getByText("Entre na sua conta para consultar os pedidos.")).toBeInTheDocument();
    expect(api.listOrders).not.toHaveBeenCalled();
  });

  it("mostra o pedido ausente sem trocar o endereço", async () => {
    vi.mocked(api.listOrders).mockResolvedValue([]);
    renderPedido("/historico/42");

    expect(await screen.findByRole("heading", { name: "Pedido não encontrado." })).toBeInTheDocument();
    expect(api.listOrders).toHaveBeenCalledWith(loggedUser.userId);
    expect(screen.getByRole("link", { name: "Voltar para Meus pedidos" })).toHaveAttribute("href", "/historico");
  });

  it("recusa um identificador que não é número", () => {
    renderPedido("/historico/abc");

    expect(screen.getByRole("heading", { name: "Pedido não encontrado." })).toBeInTheDocument();
    expect(api.listOrders).not.toHaveBeenCalled();
  });

  it("acende só o passo atual e o horário do recebimento", async () => {
    vi.mocked(api.listOrders).mockResolvedValue([confirmedOrder]);
    renderPedido("/historico/42");

    const current = await screen.findByRole("listitem", { current: "step" });
    expect(current).toHaveTextContent("Pedido recebido");
    expect(current).toHaveTextContent(
      new Date(confirmedOrder.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
    expect(screen.getByText("Em preparo").closest("li")).not.toHaveAttribute("aria-current");
    expect(screen.getByText("2× Red Velvet")).toBeInTheDocument();
    expect(screen.getByText("Pagamento: PIX")).toBeInTheDocument();
    expect(screen.getByText("Grátis")).toBeInTheDocument();
  });

  it("mostra o QR e o código da transação do PIX", async () => {
    vi.mocked(api.listOrders).mockResolvedValue([{ ...confirmedOrder, transactionCode: "U682SESA9H" }]);
    renderPedido("/historico/42");

    expect(await screen.findByRole("img", { name: "QR Code para pagamento PIX" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar código" })).toBeInTheDocument();
    expect(screen.getByText("Código da transação: U682SESA9H")).toBeInTheDocument();
  });

  it("mostra o final do cartão aprovado", async () => {
    vi.mocked(api.listOrders).mockResolvedValue([
      {
        ...confirmedOrder,
        paymentMethod: "CARTAO",
        cardBrand: "Visa",
        cardLast4: "1111",
        paymentStatus: "APROVADO",
        transactionCode: "AB23CD45EF",
      },
    ]);
    renderPedido("/historico/42");

    expect(await screen.findByText("Visa •••• 1111")).toBeInTheDocument();
    expect(screen.getByText("Aprovado")).toBeInTheDocument();
    expect(screen.getByText("Código da transação: AB23CD45EF")).toBeInTheDocument();
  });

  it("mostra o cartão recusado", async () => {
    vi.mocked(api.listOrders).mockResolvedValue([
      {
        ...confirmedOrder,
        paymentMethod: "CARTAO",
        cardBrand: "Visa",
        cardLast4: "0002",
        paymentStatus: "RECUSADO",
        transactionCode: "RECUSADO02",
      },
    ]);
    renderPedido("/historico/42");

    expect(await screen.findByText("Visa •••• 0002")).toBeInTheDocument();
    expect(screen.getByText("Recusado")).toBeInTheDocument();
  });

  it("mostra o dinheiro na entrega", async () => {
    vi.mocked(api.listOrders).mockResolvedValue([
      {
        ...confirmedOrder,
        paymentMethod: "DINHEIRO",
        transactionCode: "DINHEIRO01",
      },
    ]);
    renderPedido("/historico/42");

    expect(await screen.findByText("O pagamento será feito em dinheiro na entrega.")).toBeInTheDocument();
    expect(screen.getByText("Código da transação: DINHEIRO01")).toBeInTheDocument();
  });

  it("explica o cancelamento sem a linha de entrega", async () => {
    vi.mocked(api.listOrders).mockResolvedValue([{ ...confirmedOrder, status: "CANCELED" }]);
    renderPedido("/historico/42");

    expect(await screen.findByText("Este pedido foi cancelado.")).toBeInTheDocument();
    expect(screen.queryByText("Pedido recebido")).not.toBeInTheDocument();
    expect(screen.queryByText("Saiu para entrega")).not.toBeInTheDocument();
    expect(screen.getByText("2× Red Velvet")).toBeInTheDocument();
    expect(screen.getByText("Total").closest("div")).toHaveTextContent(/R\$\s*25,80/);
  });

  it("acompanha a troca de status e mantém o pedido se a consulta falhar", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    vi.mocked(api.listOrders)
      .mockResolvedValueOnce([confirmedOrder])
      .mockResolvedValueOnce([{ ...confirmedOrder, status: "PREPARING" }])
      .mockRejectedValueOnce(new Error("sem rede"));
    renderPedido("/historico/42");

    expect(await screen.findByRole("listitem", { current: "step" })).toHaveTextContent("Pedido recebido");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(await screen.findByRole("listitem", { current: "step" })).toHaveTextContent("Em preparo");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(screen.getByRole("heading", { name: "Pedido #42" })).toBeInTheDocument();
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Em preparo");
    expect(screen.getByRole("status")).toHaveTextContent("sem rede");
  });
});