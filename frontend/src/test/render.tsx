import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement, ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import type { AuthUser, CartItem } from "../types";

interface ProvidersOptions {
  route?: string;
  user?: AuthUser | null;
  cart?: CartItem[];
}

function Providers({
  children,
  route = "/",
}: {
  children: ReactNode;
  route?: string;
}) {
  return (
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  { route = "/", user = null, cart = [], ...options }: ProvidersOptions & RenderOptions = {}
) {
  if (user) {
    localStorage.setItem("cupcake-auth", JSON.stringify(user));
  }
  if (cart.length > 0) {
    localStorage.setItem("cupcake-cart", JSON.stringify(cart));
  }

  return render(ui, {
    wrapper: ({ children }) => <Providers route={route}>{children}</Providers>,
    ...options,
  });
}
