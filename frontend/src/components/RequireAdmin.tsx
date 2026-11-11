import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <section className="panel narrow">
        <h1>Área restrita</h1>
        <p>Entre com uma conta de administrador para continuar.</p>
        <Link to="/login">Entrar</Link>
      </section>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <section className="panel narrow">
        <h1>Área restrita</h1>
        <p>Somente administradores podem acessar esta página.</p>
      </section>
    );
  }

  return <>{children}</>;
}
