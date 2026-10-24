import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Feedback } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import type { FeedbackMessage } from "../types";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const response = await api.login({ email, password });
      login({ userId: response.userId, name: response.name, email: response.email });
      setFeedback({ type: "success", text: response.message });
      setTimeout(() => navigate("/"), 600);
    } catch (error) {
      setFeedback({ type: "error", text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel narrow">
      <h1>Entrar</h1>
      <Feedback message={feedback} />
      <form onSubmit={onSubmit} className="form">
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
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p>
        Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
      </p>
    </section>
  );
}
