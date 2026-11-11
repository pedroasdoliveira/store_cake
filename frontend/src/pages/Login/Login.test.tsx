import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { adminUser, anaUser } from "../../test/fixtures";
import { renderWithProviders } from "../../test/render";
import { Login } from ".";

vi.mock("../../api/client", () => ({
  api: {
    login: vi.fn(),
  },
}));

import { api } from "../../api/client";

describe("Login", () => {
  it("autentica e mostra mensagem de sucesso", async () => {
    const user = userEvent.setup();
    vi.mocked(api.login).mockResolvedValue({
      ...anaUser,
      message: "Login realizado com sucesso.",
    });

    renderWithProviders(<Login />, { route: "/login" });

    await user.type(screen.getByLabelText("E-mail"), anaUser.email);
    await user.type(screen.getByLabelText("Senha"), anaUser.password);
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(api.login).toHaveBeenCalledWith({ email: anaUser.email, password: anaUser.password });
    expect(await screen.findByRole("status")).toHaveTextContent("Login realizado com sucesso.");
    expect(JSON.parse(localStorage.getItem("cupcake-auth") ?? "{}")).toMatchObject({
      email: "ana@loja.com",
      role: "CUSTOMER",
    });
  });

  it("guarda a sessão de administrador", async () => {
    const user = userEvent.setup();
    vi.mocked(api.login).mockResolvedValue({
      ...adminUser,
      message: "Login realizado com sucesso.",
    });

    renderWithProviders(<Login />, { route: "/login" });
    await user.type(screen.getByLabelText("E-mail"), adminUser.email);
    await user.type(screen.getByLabelText("Senha"), adminUser.password);
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Login realizado com sucesso.");
    expect(JSON.parse(localStorage.getItem("cupcake-auth") ?? "{}")).toMatchObject({
      role: "ADMIN",
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
