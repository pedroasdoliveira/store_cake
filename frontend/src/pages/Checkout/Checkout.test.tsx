import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cartItem, confirmedOrder, loggedUser } from "../../test/fixtures";
import { renderWithProviders } from "../../test/render";
import { Checkout } from ".";

vi.mock("../../api/client", () => ({
  api: {
    createOrder: vi.fn(),
    lookupZipCode: vi.fn(),
    listOrders: vi.fn(),
    listPromotions: vi.fn().mockResolvedValue([]),
  },
}));

import { api } from "../../api/client";

const zipAddress = {
  street: "Praça da Sé",
  neighborhood: "Sé",
  city: "São Paulo",
  state: "SP",
  zipCode: "01001-000",
};

function renderCheckout() {
  return renderWithProviders(<Checkout />, {
    route: "/checkout",
    user: loggedUser,
    cart: [cartItem],
  });
}

async function saveAddress(user: ReturnType<typeof userEvent.setup>) {
  vi.mocked(api.lookupZipCode).mockResolvedValue(zipAddress);
  const cep = await screen.findByLabelText("CEP");
  await user.click(cep);
  await user.paste("01001000");
  expect(await screen.findByDisplayValue("Praça da Sé")).toBeInTheDocument();
  await user.type(screen.getByLabelText("Número"), "100");
  await user.click(screen.getByRole("button", { name: "Salvar endereço" }));
  expect(await screen.findByText("Endereço selecionado")).toBeInTheDocument();
}

describe("Checkout", () => {
  beforeEach(() => {
    vi.mocked(api.listOrders).mockReset();
    vi.mocked(api.listOrders).mockResolvedValue([]);
    vi.mocked(api.lookupZipCode).mockReset();
    vi.mocked(api.createOrder).mockReset();
    vi.mocked(api.listPromotions).mockReset();
    vi.mocked(api.listPromotions).mockResolvedValue([]);
  });

  it("pede login quando o usuário não está autenticado", () => {
    renderWithProviders(<Checkout />, { route: "/checkout", cart: [cartItem] });
    expect(screen.getByText("Faça login para finalizar o pedido.")).toBeInTheDocument();
  });

  it("troca UF por um select com os estados e preenche o endereço pelo CEP", async () => {
    const user = userEvent.setup();
    vi.mocked(api.lookupZipCode).mockResolvedValue(zipAddress);
    renderCheckout();

    const state = await screen.findByLabelText("UF");
    expect(state.tagName).toBe("SELECT");
    expect(screen.getAllByRole("option", { name: /—/ })).toHaveLength(27);

    await user.click(screen.getByLabelText("CEP"));
    await user.paste("01001000");

    expect(await screen.findByDisplayValue("Praça da Sé")).toBeInTheDocument();
    expect(screen.getByLabelText("Bairro")).toHaveValue("Sé");
    expect(screen.getByLabelText("Cidade")).toHaveValue("São Paulo");
    expect(state).toHaveValue("SP");
    expect(api.lookupZipCode).toHaveBeenCalledWith("01001000");
  });

  it("mostra o endereço salvo, permite trocar e cadastrar outro", async () => {
    const user = userEvent.setup();
    vi.mocked(api.listOrders).mockResolvedValue([
      confirmedOrder,
      {
        ...confirmedOrder,
        id: 43,
        street: "Rua do Chocolate",
        number: "20",
        neighborhood: "Bela Vista",
        zipCode: "01310-100",
      },
    ]);
    renderCheckout();

    const summary = (await screen.findByText("Endereço selecionado")).parentElement;
    expect(summary).toHaveTextContent("Rua das Flores, 100");
    expect(screen.queryByLabelText("CEP")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Trocar endereço" }));
    await user.click(screen.getByRole("radio", { name: /Rua do Chocolate, 20/ }));
    expect(summary).toHaveTextContent("Rua do Chocolate, 20");
    expect(summary).toHaveTextContent("Bela Vista");

    await user.click(screen.getByRole("button", { name: "Adicionar novo endereço" }));
    expect(screen.getByLabelText("CEP")).toBeInTheDocument();
  });

  it("impede finalizar sem endereço e leva o PIX para o QR Code", async () => {
    const user = userEvent.setup();
    vi.mocked(api.createOrder).mockResolvedValue(confirmedOrder);
    renderCheckout();

    const summary = await screen.findByRole("region", { name: "Seu pedido" });
    expect(summary).toHaveTextContent("Entrega");
    expect(summary).toHaveTextContent("Grátis");
    expect(summary).toHaveTextContent("Total");
    expect(summary).toHaveTextContent(/25,80/);
    expect(summary).not.toHaveTextContent("Desconto");
    expect(screen.getByRole("region", { name: "Endereço de entrega" })).not.toHaveTextContent("Total");
    expect(screen.getByRole("region", { name: "Pagamento" })).not.toHaveTextContent("25,80");
    expect(screen.queryByText(/Total atual/)).not.toBeInTheDocument();
    expect(await screen.findByText("Salve um endereço de entrega para finalizar a compra.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pagar" })).toBeDisabled();

    await saveAddress(user);
    await user.click(screen.getByRole("button", { name: "Pagar" }));

    expect(api.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: loggedUser.userId,
        street: "Praça da Sé",
        number: "100",
        city: "São Paulo",
        state: "SP",
        zipCode: "01001-000",
        paymentMethod: "PIX",
        items: [{ productId: 1, quantity: 2 }],
      })
    );
    expect(await screen.findByRole("heading", { name: "Pague com PIX" })).toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveTextContent(/15:00|14:59/);
    expect(await screen.findByRole("img", { name: "QR Code para pagamento PIX" })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("cupcake-cart") ?? "[]")).toEqual([]);
  });

  it("envia a promoção escolhida no pedido", async () => {
    const user = userEvent.setup();
    vi.mocked(api.listPromotions).mockResolvedValue([
      {
        id: 5,
        title: "Semana do chocolate",
        description: "Em qualquer pedido.",
        discountPercent: 10,
        active: true,
      },
    ]);
    vi.mocked(api.createOrder).mockResolvedValue({
      ...confirmedOrder,
      promotionTitle: "Semana do chocolate",
      subtotal: 25.8,
      discountAmount: 2.58,
      total: 23.22,
    });
    renderCheckout();

    await user.selectOptions(await screen.findByLabelText("Promoção"), "5");
    expect(
      screen.getByText("O desconto de Semana do chocolate entra no total quando o pedido for confirmado.")
    ).toBeInTheDocument();
    expect(screen.getByText("Total").closest("div")).toHaveTextContent(/R\$\s*25,80/);
    await saveAddress(user);
    await user.click(screen.getByRole("button", { name: "Pagar" }));

    expect(api.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        promotionId: 5,
      })
    );
  });

  it("anima o cartão conforme o preenchimento e confirma o pedido", async () => {
    const user = userEvent.setup();
    vi.mocked(api.createOrder).mockResolvedValue({ ...confirmedOrder, paymentMethod: "CARTAO" });
    renderCheckout();
    await saveAddress(user);

    await user.click(screen.getByRole("radio", { name: "Cartão de crédito" }));
    expect(screen.getByRole("button", { name: "Pagar" })).toBeDisabled();

    await user.click(screen.getByLabelText("Número do cartão"));
    await user.paste("4111111111111111");
    await user.type(screen.getByLabelText("Nome impresso no cartão"), "Ana Cupcake");
    await user.click(screen.getByLabelText("Validade"));
    await user.paste("1230");
    await user.click(screen.getByLabelText("CVV"));
    await user.paste("123");

    expect(document.querySelector(".credit-card-inner")).toHaveClass("is-flipped");
    expect(document.querySelector(".credit-card-number")).toHaveTextContent("4111111111111111");
    expect(screen.getByText("ANA CUPCAKE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pagar" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Pagar" }));

    const payload = vi.mocked(api.createOrder).mock.calls[0][0] as {
      paymentMethod: string;
      cvv?: string;
      cardLast4?: string;
      cardBrand?: string;
    };
    expect(payload.paymentMethod).toBe("CARTAO");
    expect(payload.cvv).toBeUndefined();
    expect(payload.cardLast4).toBe("1111");
    expect(payload.cardBrand).toBe("Visa");
    expect(await screen.findByRole("heading", { name: "Pedido confirmado" })).toBeInTheDocument();
  });

  it("avisa quando o CEP não é encontrado", async () => {
    const user = userEvent.setup();
    vi.mocked(api.lookupZipCode).mockRejectedValue(new Error("CEP não encontrado."));
    renderCheckout();

    await user.click(await screen.findByLabelText("CEP"));
    await user.paste("00000000");

    expect(await screen.findByRole("status")).toHaveTextContent("CEP não encontrado.");
  });
});
