import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Feedback } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import type { FeedbackMessage, Order } from "../types";
import { formatCurrency } from "../utils/money";

export function Historico() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    setLoading(true);
    api
      .listOrders(user.userId)
      .then(setOrders)
      .catch((error: Error) => setFeedback({ type: "error", text: error.message }))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <section className="panel">
        <h1>Histórico de pedidos</h1>
        <p>Entre na sua conta para consultar os pedidos.</p>
        <Link to="/login" className="button-link">
          Entrar
        </Link>
      </section>
    );
  }

  return (
    <section className="panel">
      <h1>Histórico de pedidos</h1>
      <Feedback message={feedback} />
      {loading && <p>Carregando pedidos...</p>}
      {!loading && orders.length === 0 && <p>Você ainda não realizou pedidos.</p>}
      <div className="order-list">
        {orders.map((order) => (
          <article key={order.id} className="order-card">
            <header>
              <h2>Pedido #{order.id}</h2>
              <span>{order.status}</span>
            </header>
            <p>{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
            <p>
              {order.street}, {order.number} - {order.city}/{order.state}
            </p>
            <ul>
              {order.items.map((item) => (
                <li key={`${order.id}-${item.productId}`}>
                  {item.quantity}x {item.productName} — {formatCurrency(item.subtotal)}
                </li>
              ))}
            </ul>
            <strong>Total: {formatCurrency(order.total)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
