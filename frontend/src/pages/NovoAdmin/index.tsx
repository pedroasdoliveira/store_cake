import { FormEvent, useState } from "react";
import { api } from "../../api/client";
import { Feedback } from "../../components/Feedback";
import { useAuth } from "../../context/AuthContext";
import type { FeedbackMessage } from "../../types";

export function NovoAdmin() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const response = await api.registerAdmin({
        adminUserId: user.userId,
        name,
        email,
        password,
      });
      setName("");
      setEmail("");
      setPassword("");
      setFeedback({ type: "success", text: response.message });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Não foi possível cadastrar o administrador.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel narrow">
      <h1>Novo administrador</h1>
      <p>Crie outra conta com acesso ao painel. Esta página não aparece no menu da loja.</p>
      <Feedback message={feedback} />
      <form onSubmit={onSubmit} className="form">
        <label>
          Nome
          <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
        </label>
        <label>
          E-mail
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Criar administrador"}
        </button>
      </form>
    </section>
  );
}
