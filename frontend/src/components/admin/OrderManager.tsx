import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type { FeedbackMessage, Order } from "../../types";
import { formatCurrency } from "../../utils/money";
import { orderStatuses, orderStatusLabel } from "../../utils/orderStatus";
import { Feedback } from "../Feedback";

export function OrderManager() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user) {
      return;
    }
    setLoading(true);
    api
      .listAdminOrders(user.userId)
      .then(setOrders)
      .catch((error: Error) => setFeedback({ type: "error", text: error.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user]);

  const generated = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="admin-section">
      <h2>Pedidos</h2>
      <p>
        {orders.length} pedido(s). Valor gerado: <strong>{formatCurrency(generated)}</strong>
      </p>
      <Feedback message={feedback} />
      {loading ? <p>Carregando pedidos...</p> : null}
      {!loading && orders.length === 0 && <p>Nenhum pedido registrado.</p>}
      <div className="order-list">
        {orders.map((order) => (
          <OrderEditor
            key={order.id}
            order={order}
            onSaved={async (next) => {
              if (!user) {
                return;
              }
              try {
                const saved = await api.updateOrder(user.userId, order.id, next);
                setOrders((current) => current.map((item) => (item.id === saved.id ? saved : item)));
                setFeedback({ type: "success", text: `Pedido #${saved.id} atualizado.` });
              } catch (error) {
                setFeedback({
                  type: "error",
                  text: error instanceof Error ? error.message : "Não foi possível atualizar o pedido.",
                });
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

function OrderEditor({
  order,
  onSaved,
}: {
  order: Order;
  onSaved: (payload: {
    status: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    deliveryNote?: string;
  }) => Promise<void>;
}) {
  const [status, setStatus] = useState(order.status);
  const [street, setStreet] = useState(order.street);
  const [number, setNumber] = useState(order.number);
  const [neighborhood, setNeighborhood] = useState(order.neighborhood);
  const [city, setCity] = useState(order.city);
  const [state, setState] = useState(order.state);
  const [zipCode, setZipCode] = useState(order.zipCode);
  const [deliveryNote, setDeliveryNote] = useState(order.deliveryNote ?? "");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSaved({
        status,
        street,
        number,
        complement: order.complement,
        neighborhood,
        city,
        state,
        zipCode,
        deliveryNote,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="order-card">
      <header>
        <h3>
          Pedido #{order.id} — {order.customerName ?? "Cliente"}
        </h3>
        <span>{orderStatusLabel(order.status)}</span>
      </header>
      <ul>
        {order.items.map((item) => (
          <li key={`${order.id}-${item.productId}`}>
            {item.quantity}x {item.productName} — {formatCurrency(item.subtotal)}
          </li>
        ))}
      </ul>
      {order.promotionTitle && <p>Promoção: {order.promotionTitle}</p>}
      <p>Total gerado: {formatCurrency(order.total)}</p>
      <form onSubmit={onSubmit} className="form">
        <label>
          Status do pedido {order.id}
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {orderStatuses.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rua do pedido {order.id}
          <input value={street} onChange={(event) => setStreet(event.target.value)} required />
        </label>
        <label>
          Número do pedido {order.id}
          <input value={number} onChange={(event) => setNumber(event.target.value)} required />
        </label>
        <label>
          Bairro do pedido {order.id}
          <input value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} required />
        </label>
        <label>
          Cidade do pedido {order.id}
          <input value={city} onChange={(event) => setCity(event.target.value)} required />
        </label>
        <label>
          UF do pedido {order.id}
          <input value={state} onChange={(event) => setState(event.target.value)} required minLength={2} maxLength={2} />
        </label>
        <label>
          CEP do pedido {order.id}
          <input value={zipCode} onChange={(event) => setZipCode(event.target.value)} required />
        </label>
        <label>
          Observação do pedido {order.id}
          <input value={deliveryNote} onChange={(event) => setDeliveryNote(event.target.value)} />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? "Salvando..." : `Salvar pedido ${order.id}`}
        </button>
      </form>
    </article>
  );
}
