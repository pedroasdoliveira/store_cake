import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Feedback } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import type { FeedbackMessage } from "../types";

export function Cadastro() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const response = await api.register({ name, email, password });
      login({ userId: response.userId, name: response.name, email: response.email });
      setFeedback({ type: "success", text: response.message });
      setTimeout(() => navigate("/"), 700);
    } catch (error) {
      setFeedback({ type: "error", text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel narrow">
      <h1>Cadastro</h1>
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
          {loading ? "Cadastrando..." : "Criar conta"}
        </button>
      </form>
      <p>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </section>
  );
}
