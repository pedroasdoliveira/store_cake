import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { Feedback } from "../../components/Feedback";
import { useAuth } from "../../context/AuthContext";
import type { FeedbackMessage, Order } from "../../types";
import { PaymentProof } from "../../components/PaymentProof";
import { formatCurrency } from "../../utils/money";
import { customerOrderStatusLabel } from "../../utils/orderStatus";

const trackedStatuses = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

const steps = [
  { status: "CONFIRMED", label: "Pedido recebido" },
  { status: "PREPARING", label: "Em preparo" },
  { status: "OUT_FOR_DELIVERY", label: "Saiu para entrega" },
  { status: "DELIVERED", label: "Entregue" },
];

function stepTime(createdAt: string) {
  return new Date(createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function Pedido() {
  const { id } = useParams();
  const { user } = useAuth();
  const orderId = Number(id);
  const idIsValid = Number.isInteger(orderId) && orderId > 0;
  const [order, setOrder] = useState<Order | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!user || !idIsValid) {
      return;
    }
    let active = true;
    setLoading(true);
    setMissing(false);
    setFeedback(null);
    api
      .listOrders(user.userId)
      .then((orders) => {
        if (!active) {
          return;
        }
        const found = orders.find((item) => item.id === orderId) ?? null;
        setOrder(found);
        setMissing(!found);
      })
      .catch((error: Error) => {
        if (active) {
          setFeedback({ type: "error", text: error.message });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [user, idIsValid, orderId]);

  useEffect(() => {
    if (!user || !order || !trackedStatuses.slice(0, 3).includes(order.status)) {
      return;
    }
    const timer = window.setInterval(() => {
      api
        .listOrders(user.userId)
        .then((orders) => {
          const next = orders.find((item) => item.id === order.id);
          if (next) {
            setOrder(next);
          }
        })
        .catch((error: Error) => {
          setFeedback({ type: "error", text: error.message });
        });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [user, order]);

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

  if (!idIsValid || missing) {
    return (
      <section className="panel">
        <h1>Pedido não encontrado.</h1>
        <Link to="/historico">Voltar para Meus pedidos</Link>
      </section>
    );
  }

  const currentIndex = steps.findIndex((step) => step.status === order?.status);

  return (
    <section>
      <p>
        <Link to="/historico">Meus pedidos</Link>
      </p>
      <Feedback message={feedback} />
      {loading && <p>Carregando pedido...</p>}
      {order && (
        <>
          <h1>Pedido #{order.id}</h1>
          {order.status === "CANCELED" ? (
            <p>Este pedido foi cancelado.</p>
          ) : trackedStatuses.includes(order.status) ? (
            <ol className="order-steps">
              {steps.map((step, index) => {
                const state = index < currentIndex ? "is-done" : index === currentIndex ? "is-current" : "is-upcoming";
                return (
                  <li
                    key={step.status}
                    className={`order-step ${state}`}
                    aria-current={index === currentIndex ? "step" : undefined}
                  >
                    <span>{step.label}</span>
                    {index === 0 && <span>{stepTime(order.createdAt)}</span>}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p>{customerOrderStatusLabel(order.status)}</p>
          )}

          <div className="order-detail-columns">
            <section className="panel" aria-labelledby="order-items-title">
              <h2 id="order-items-title">Itens</h2>
              <ul className="summary-items">
                {order.items.map((item) => (
                  <li key={`${order.id}-${item.productId}`}>
                    <span>
                      {item.quantity}× {item.productName}
                    </span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <dl className="checkout-totals">
                {order.subtotal != null && (
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatCurrency(order.subtotal)}</dd>
                  </div>
                )}
                {(order.discountAmount ?? 0) > 0 && (
                  <div>
                    <dt>Desconto{order.promotionTitle ? ` ${order.promotionTitle}` : ""}</dt>
                    <dd>- {formatCurrency(order.discountAmount ?? 0)}</dd>
                  </div>
                )}
                <div>
                  <dt>Entrega</dt>
                  <dd>Grátis</dd>
                </div>
                <div className="checkout-grand-total">
                  <dt>Total</dt>
                  <dd>{formatCurrency(order.total)}</dd>
                </div>
              </dl>
            </section>

            <section className="panel" aria-labelledby="order-delivery-title">
              <h2 id="order-delivery-title">Entrega e pagamento</h2>
              <p>
                {order.street}, {order.number}
                {order.complement ? `, ${order.complement}` : ""}
              </p>
              <p>
                {order.neighborhood} — {order.city}/{order.state}
              </p>
              <p>CEP {order.zipCode}</p>
              {order.deliveryNote && <p>Observação: {order.deliveryNote}</p>}
              <PaymentProof order={order} />
            </section>
          </div>
        </>
      )}
    </section>
  );
}
