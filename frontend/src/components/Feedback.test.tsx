import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Feedback } from "./Feedback";

describe("Feedback", () => {
  it("não renderiza nada sem mensagem", () => {
    const { container } = render(<Feedback message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("exibe mensagem de sucesso", () => {
    render(<Feedback message={{ type: "success", text: "Cadastro realizado com sucesso." }} />);
    expect(screen.getByRole("status")).toHaveTextContent("Cadastro realizado com sucesso.");
    expect(screen.getByRole("status")).toHaveClass("success");
  });

  it("exibe mensagem de erro", () => {
    render(<Feedback message={{ type: "error", text: "E-mail ou senha inválidos." }} />);
    expect(screen.getByRole("status")).toHaveTextContent("E-mail ou senha inválidos.");
    expect(screen.getByRole("status")).toHaveClass("error");
  });
});
