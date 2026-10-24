import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { cartItem, loggedUser } from "../test/fixtures";
import { renderWithProviders } from "../test/render";
import { Navbar } from "./Navbar";

describe("Navbar", () => {
  it("mostra links de entrada quando não há sessão", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByRole("link", { name: /Doce Ninho/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cadastrar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Carrinho (0)" })).toBeInTheDocument();
  });

  it("mostra o nome do usuário, pedidos e quantidade do carrinho", async () => {
    renderWithProviders(<Navbar />, { user: loggedUser, cart: [cartItem] });

    expect(await screen.findByText("Ana Cupcake")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pedidos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Carrinho (2)" })).toBeInTheDocument();
  });

  it("sai da conta ao clicar em Sair", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar />, { user: loggedUser });

    await screen.findByText("Ana Cupcake");
    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
    expect(localStorage.getItem("cupcake-auth")).toBeNull();
  });
});
