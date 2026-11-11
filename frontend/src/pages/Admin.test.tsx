import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { adminUser, loggedUser, redVelvet } from "../test/fixtures";
import { renderWithProviders } from "../test/render";

vi.mock("../api/client", () => ({
  api: {
    listCategories: vi.fn(),
    createCategory: vi.fn(),
    listProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    listAdminPromotions: vi.fn().mockResolvedValue([]),
    createPromotion: vi.fn(),
    updatePromotion: vi.fn(),
  },
}));

import { api } from "../api/client";

describe("Admin", () => {
  beforeEach(() => {
    vi.mocked(api.listCategories).mockResolvedValue([
      { id: 1, name: "Clássicos", description: "Receitas de sempre da casa." },
    ]);
    vi.mocked(api.listProducts).mockResolvedValue([redVelvet]);
    vi.mocked(api.createCategory).mockResolvedValue({
      id: 4,
      name: "Especiais",
      description: "Edições da casa",
    });
    vi.mocked(api.updateProduct).mockResolvedValue({
      ...redVelvet,
      name: "Red Velvet Especial",
      discountPercent: 15,
      salePrice: 10.97,
    });
  });

  it("nega o painel para um cliente", async () => {
    renderWithProviders(<App />, { route: "/admin", user: loggedUser });

    expect(await screen.findByText("Somente administradores podem acessar esta página.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Novo administrador" })).not.toBeInTheDocument();
  });

  it("cria um catálogo e atualiza um produto", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/admin", user: adminUser });

    expect(await screen.findByRole("heading", { name: "Painel da loja" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Painel" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /novo administrador/i })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Nome"), "Especiais");
    await user.type(screen.getByLabelText("Descrição"), "Edições da casa");
    await user.click(screen.getByRole("button", { name: "Adicionar catálogo" }));

    expect(api.createCategory).toHaveBeenCalledWith(1, {
      name: "Especiais",
      description: "Edições da casa",
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Catálogo adicionado à vitrine.");

    await user.click(screen.getByRole("button", { name: "Produtos" }));
    await user.click(await screen.findByRole("button", { name: "Editar Red Velvet" }));
    const title = screen.getByLabelText("Título");
    await user.clear(title);
    await user.type(title, "Red Velvet Especial");
    const discount = screen.getByLabelText("Desconto (%)");
    await user.clear(discount);
    await user.type(discount, "15");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(api.updateProduct).toHaveBeenCalledWith(
      1,
      1,
      expect.objectContaining({
        name: "Red Velvet Especial",
        discountPercent: 15,
        category: "Clássicos",
      })
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Produto atualizado.");
  });

  it("publica uma promoção para a página inicial", async () => {
    const user = userEvent.setup();
    vi.mocked(api.createPromotion).mockResolvedValue({
      id: 5,
      title: "Semana do chocolate",
      description: "Em qualquer pedido.",
      discountPercent: 10,
      active: true,
    });
    renderWithProviders(<App />, { route: "/admin", user: adminUser });

    await user.click(await screen.findByRole("button", { name: "Promoções" }));
    await user.type(screen.getByLabelText("Título"), "Semana do chocolate");
    await user.type(screen.getByLabelText("Descrição"), "Em qualquer pedido.");
    await user.click(screen.getByRole("button", { name: "Publicar promoção" }));

    expect(api.createPromotion).toHaveBeenCalledWith(1, {
      title: "Semana do chocolate",
      description: "Em qualquer pedido.",
      discountPercent: 10,
      active: true,
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Promoção publicada na página inicial.");
  });
});
