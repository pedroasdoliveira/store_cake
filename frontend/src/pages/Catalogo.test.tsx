import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { chocolate, redVelvet } from "../test/fixtures";
import { renderWithProviders } from "../test/render";
import { Catalogo } from "./Catalogo";

vi.mock("../api/client", () => ({
  api: {
    listProducts: vi.fn(),
    listCategories: vi.fn().mockResolvedValue([
      { id: 1, name: "Clássicos", description: "Receitas de sempre da casa." },
      { id: 2, name: "Chocolate", description: "Massas e coberturas de cacau." },
      { id: 3, name: "Frutas", description: "Sabores cítricos e de fruta fresca." },
    ]),
  },
}));

import { api } from "../api/client";

describe("Catalogo", () => {
  beforeEach(() => {
    vi.mocked(api.listProducts).mockResolvedValue([redVelvet, chocolate]);
  });

  it("carrega a vitrine e permite filtrar por categoria", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Catalogo />);

    expect(screen.getByText("Carregando vitrine...")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Red Velvet" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Chocolate Belga" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Chocolate" }));

    expect(screen.queryByRole("heading", { name: "Red Velvet" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Chocolate Belga" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Frutas" }));
    expect(screen.getByText("Nenhum cupcake neste catálogo.")).toBeInTheDocument();
  });

  it("mostra feedback ao adicionar um cupcake", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Catalogo />);
    await screen.findByRole("heading", { name: "Red Velvet" });

    await user.click(screen.getAllByRole("button", { name: "Adicionar" })[0]);

    expect(screen.getByRole("status")).toHaveTextContent("Red Velvet adicionado ao carrinho.");
  });

  it("mostra erro quando a API falha", async () => {
    vi.mocked(api.listProducts).mockRejectedValue(new Error("API indisponível"));
    renderWithProviders(<Catalogo />);

    expect(await screen.findByRole("status")).toHaveTextContent("API indisponível");
  });
});
