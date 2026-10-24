import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { redVelvet } from "../test/fixtures";
import { renderWithProviders } from "../test/render";
import { ProductCard } from "./ProductCard";

describe("ProductCard", () => {
  it("mostra nome, categoria, preço e descrição", () => {
    renderWithProviders(<ProductCard product={redVelvet} onAdded={() => undefined} />);

    expect(screen.getByRole("heading", { name: "Red Velvet" })).toBeInTheDocument();
    expect(screen.getByText("Clássicos")).toBeInTheDocument();
    expect(screen.getByText("Massa aveludada com cream cheese.")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*12,90/)).toBeInTheDocument();
  });

  it("adiciona o produto ao carrinho e dispara o callback", async () => {
    const user = userEvent.setup();
    const onAdded = vi.fn();
    renderWithProviders(<ProductCard product={redVelvet} onAdded={onAdded} />);

    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(onAdded).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem("cupcake-cart") ?? "[]")).toEqual([
      expect.objectContaining({ id: 1, quantity: 1 }),
    ]);
  });
});
