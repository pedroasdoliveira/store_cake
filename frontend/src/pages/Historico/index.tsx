import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { Feedback } from "../../components/Feedback";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import type { FeedbackMessage, Order } from "../../types";
import { formatCurrency } from "../../utils/money";
import { customerOrderStatusLabel, trackingMessage } from "../../utils/orderStatus";

function cupcakeCount(order: Order) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function Historico() {
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
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

  const activeOrder = [...orders]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .find((order) => order.status !== "DELIVERED" && order.status !== "CANCELED");
  const activeMessage = activeOrder ? trackingMessage(activeOrder) : null;

  const reorder = async (order: Order) => {
    setFeedback(null);
    try {
      const products = await api.listProducts();
      const missingNames: string[] = [];
      let added = false;
      for (const item of order.items) {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product) {
          missingNames.push(item.productName);
          continue;
        }
        for (let count = 0; count < item.quantity; count += 1) {
          add(product);
        }
        added = true;
      }
      if (!added) {
        setFeedback({ type: "error", text: "Nenhum item deste pedido está no cardápio." });
        return;
      }
      navigate("/carrinho", { state: missingNames.length > 0 ? { missingNames } : undefined });
    } catch {
      setFeedback({ type: "error", text: "Não foi possível consultar o cardápio." });
    }
  };

  if (!user) {
    return (
      <section className="panel">
        <h1>Meus pedidos</h1>
        <p>Entre na sua conta para consultar os pedidos.</p>
        <Link to="/login" className="button-link">
          Entrar
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h1>Meus pedidos</h1>
      <Feedback message={feedback} />
      {loading && <p>Carregando pedidos...</p>}
      {!loading && orders.length === 0 && <p>Você ainda não realizou pedidos.</p>}
      {activeOrder && activeMessage && (
        <p className="order-banner">
          <span>{activeMessage}</span>
          <Link to={`/historico/${activeOrder.id}`} className="button-link">
            Acompanhar pedido
          </Link>
        </p>
      )}
      <div className="order-list">
        {orders.map((order) => {
          const count = cupcakeCount(order);
          return (
            <article key={order.id} className="order-card">
              <header>
                <h2>Pedido #{order.id}</h2>
                <span className="badge">{customerOrderStatusLabel(order.status)}</span>
              </header>
              <p>{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
              <p>{count === 1 ? "1 cupcake" : `${count} cupcakes`}</p>
              <strong>Total: {formatCurrency(order.total)}</strong>
              <div className="checkout-actions">
                <button type="button" className="ghost" onClick={() => void reorder(order)}>
                  Pedir de novo
                </button>
                <Link to={`/historico/${order.id}`} className="button-link">
                  Detalhes
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
