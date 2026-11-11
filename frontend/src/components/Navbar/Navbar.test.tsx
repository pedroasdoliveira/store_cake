import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { adminUser, cartItem, loggedUser } from "../../test/fixtures";
import { renderWithProviders } from "../../test/render";
import { Navbar } from ".";

describe("Navbar", () => {
  it("mostra links de entrada quando não há sessão", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByRole("link", { name: /Doce Ninho/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cadastrar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cardápio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Carrinho, 0 itens" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /administrador/i })).not.toBeInTheDocument();
  });

  it("mostra o nome do usuário, pedidos e quantidade do carrinho", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar />, { user: loggedUser, cart: [cartItem] });

    expect(await screen.findByRole("button", { name: "Ana Cupcake" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Meus pedidos" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ana Cupcake" }));
    expect(screen.getByRole("menuitem", { name: "Meus pedidos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Carrinho, 2 itens" })).toBeInTheDocument();
  });

  it("mostra o painel só para o administrador", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar />, { user: adminUser });

    expect(screen.queryByRole("menuitem", { name: "Painel" })).not.toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "Administrador" }));
    expect(screen.getByRole("menuitem", { name: "Painel" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /novo administrador/i })).not.toBeInTheDocument();
  });

  it("sai da conta ao clicar em Sair", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar />, { user: loggedUser });

    await user.click(await screen.findByRole("button", { name: "Ana Cupcake" }));
    await user.click(screen.getByRole("menuitem", { name: "Sair" }));

    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
    expect(localStorage.getItem("cupcake-auth")).toBeNull();
  });
});
