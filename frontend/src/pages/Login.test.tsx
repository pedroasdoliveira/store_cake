import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { loggedUser } from "../test/fixtures";
import { renderWithProviders } from "../test/render";
import { Login } from "./Login";

vi.mock("../api/client", () => ({
  api: {
    login: vi.fn(),
  },
}));

import { api } from "../api/client";

describe("Login", () => {
  it("autentica e mostra mensagem de sucesso", async () => {
    const user = userEvent.setup();
    vi.mocked(api.login).mockResolvedValue({
      ...loggedUser,
      message: "Login realizado com sucesso.",
    });

    renderWithProviders(<Login />, { route: "/login" });

    await user.type(screen.getByLabelText("E-mail"), "ana@loja.com");
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(api.login).toHaveBeenCalledWith({ email: "ana@loja.com", password: "senha123" });
    expect(await screen.findByRole("status")).toHaveTextContent("Login realizado com sucesso.");
    expect(JSON.parse(localStorage.getItem("cupcake-auth") ?? "{}")).toMatchObject({
      email: "ana@loja.com",
    });
  });

  it("mostra erro quando as credenciais são inválidas", async () => {
    const user = userEvent.setup();
    vi.mocked(api.login).mockRejectedValue(new Error("E-mail ou senha inválidos."));

    renderWithProviders(<Login />, { route: "/login" });

    await user.type(screen.getByLabelText("E-mail"), "ana@loja.com");
    await user.type(screen.getByLabelText("Senha"), "errada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("status")).toHaveTextContent("E-mail ou senha inválidos.");
  });
});
