import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { redVelvet } from "../test/fixtures";
import { renderWithProviders } from "../test/render";
import { useCart } from "./CartContext";

function CartProbe() {
  const { items, add, total, count } = useCart();
  return (
    <div>
      <p>count:{count}</p>
      <p>total:{total}</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name}:{item.quantity}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => add(redVelvet)}>
        add
      </button>
    </div>
  );
}

describe("CartContext", () => {
  it("persiste o carrinho no localStorage", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartProbe />);

    await user.click(screen.getByRole("button", { name: "add" }));
    await user.click(screen.getByRole("button", { name: "add" }));

    expect(screen.getByText("Red Velvet:2")).toBeInTheDocument();
    expect(screen.getByText("count:2")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("cupcake-cart") ?? "[]")[0].quantity).toBe(2);
  });
});
