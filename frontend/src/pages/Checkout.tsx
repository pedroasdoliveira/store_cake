import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Feedback } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { FeedbackMessage, Order } from "../types";
import { formatCurrency } from "../utils/money";

export function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [confirmation, setConfirmation] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "SP",
    zipCode: "",
    paymentMethod: "PIX",
  });

  if (!user) {
    return (
      <section className="panel">
        <h1>Checkout</h1>
        <p>Faça login para finalizar o pedido.</p>
        <Link to="/login" className="button-link">
          Ir para login
        </Link>
      </section>
    );
  }

  if (items.length === 0 && !confirmation) {
    return (
      <section className="panel">
        <h1>Checkout</h1>
        <p>Adicione cupcakes ao carrinho antes de finalizar.</p>
        <Link to="/" className="button-link">
          Ver vitrine
        </Link>
      </section>
    );
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const order = await api.createOrder({
        userId: user.userId,
        ...form,
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
      });
      clear();
      setConfirmation(order);
      setFeedback({
        type: "success",
        text: `Pedido #${order.id} confirmado. Total: ${formatCurrency(order.total)}.`,
      });
    } catch (error) {
      setFeedback({ type: "error", text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  if (confirmation) {
    return (
      <section className="panel narrow">
        <h1>Pedido confirmado</h1>
        <Feedback message={feedback} />
        <div className="receipt">
          <p>
            Número do pedido: <strong>#{confirmation.id}</strong>
          </p>
          <p>
            Valor total: <strong>{formatCurrency(confirmation.total)}</strong>
          </p>
          <p>Pagamento: {confirmation.paymentMethod}</p>
          <p>
            Entrega: {confirmation.street}, {confirmation.number} - {confirmation.city}/{confirmation.state}
          </p>
        </div>
        <button type="button" onClick={() => navigate("/historico")}>
          Ver histórico
        </button>
      </section>
    );
  }

  return (
    <section className="panel">
      <h1>Finalizar pedido</h1>
      <p>
        Total atual: <strong>{formatCurrency(total)}</strong>
      </p>
      <Feedback message={feedback} />
      <form onSubmit={onSubmit} className="form grid-form">
        <label>
          Rua
          <input
            value={form.street}
            onChange={(event) => setForm({ ...form, street: event.target.value })}
            required
          />
        </label>
        <label>
          Número
          <input
            value={form.number}
            onChange={(event) => setForm({ ...form, number: event.target.value })}
            required
          />
        </label>
        <label>
          Complemento
          <input
            value={form.complement}
            onChange={(event) => setForm({ ...form, complement: event.target.value })}
          />
        </label>
        <label>
          Bairro
          <input
            value={form.neighborhood}
            onChange={(event) => setForm({ ...form, neighborhood: event.target.value })}
            required
          />
        </label>
        <label>
          Cidade
          <input
            value={form.city}
            onChange={(event) => setForm({ ...form, city: event.target.value })}
            required
          />
        </label>
        <label>
          UF
          <input
            value={form.state}
            maxLength={2}
            onChange={(event) => setForm({ ...form, state: event.target.value.toUpperCase() })}
            required
          />
        </label>
        <label>
          CEP
          <input
            value={form.zipCode}
            onChange={(event) => setForm({ ...form, zipCode: event.target.value })}
            required
          />
        </label>
        <label>
          Pagamento
          <select
            value={form.paymentMethod}
            onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}
          >
            <option value="PIX">PIX</option>
            <option value="CARTAO">Cartão de crédito</option>
            <option value="DINHEIRO">Dinheiro na entrega</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Confirmando..." : "Confirmar pedido"}
        </button>
      </form>
    </section>
  );
}
