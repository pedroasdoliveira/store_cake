import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../../App";
import { adminUser, loggedUser } from "../../test/fixtures";
import { renderWithProviders } from "../../test/render";

vi.mock("../../api/client", () => ({
  api: {
    registerAdmin: vi.fn(),
  },
}));

import { api } from "../../api/client";

describe("NovoAdmin", () => {
  it("bloqueia cliente e não oferece link no menu", async () => {
    renderWithProviders(<App />, { route: "/admin/novo", user: loggedUser });

    expect(await screen.findByText("Somente administradores podem acessar esta página.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Novo administrador" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "/admin/novo" })).not.toBeInTheDocument();
  });

  it("permite que o administrador crie outra conta", async () => {
    const user = userEvent.setup();
    vi.mocked(api.registerAdmin).mockResolvedValue({
      userId: 8,
      name: "Novo Admin",
      email: "novo@doceninho.com",
      role: "ADMIN",
      message: "Administrador cadastrado com sucesso.",
    });

    renderWithProviders(<App />, { route: "/admin/novo", user: adminUser });

    expect(await screen.findByRole("heading", { name: "Novo administrador" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Novo administrador" })).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Nome"), "Novo Admin");
    await user.type(screen.getByLabelText("E-mail"), "novo@doceninho.com");
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(screen.getByRole("button", { name: "Criar administrador" }));

    expect(api.registerAdmin).toHaveBeenCalledWith({
      adminUserId: 1,
      name: "Novo Admin",
      email: "novo@doceninho.com",
      password: "senha123",
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Administrador cadastrado com sucesso.");
  });
});
