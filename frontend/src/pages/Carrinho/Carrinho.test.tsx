import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { cartItem } from "../../test/fixtures";
import { renderWithProviders } from "../../test/render";
import { Carrinho } from ".";

describe("Carrinho", () => {
  it("mostra estado vazio", () => {
    renderWithProviders(<Carrinho />, { route: "/carrinho" });

    expect(screen.getByText("Seu carrinho está vazio.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver vitrine" })).toBeInTheDocument();
  });

  it("altera quantidade, recalcula total e remove item", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Carrinho />, { route: "/carrinho", cart: [cartItem] });

    expect(screen.getByRole("heading", { name: "Seu carrinho" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Red Velvet" })).toBeInTheDocument();
    expect(screen.getByText("Total").closest("div")).toHaveTextContent(/R\$\s*25,80/);
    expect(screen.getByText("Entrega").closest("div")).toHaveTextContent("Grátis");

    await user.click(screen.getByRole("button", { name: "Aumentar quantidade de Red Velvet" }));

    expect(screen.getByText("Total").closest("div")).toHaveTextContent(/R\$\s*38,70/);

    await user.click(screen.getByRole("button", { name: "Diminuir quantidade de Red Velvet" }));
    await user.click(screen.getByRole("button", { name: "Diminuir quantidade de Red Velvet" }));
    expect(screen.getByRole("button", { name: "Diminuir quantidade de Red Velvet" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Remover" }));

    expect(screen.getByText("Seu carrinho está vazio.")).toBeInTheDocument();
  });
});
