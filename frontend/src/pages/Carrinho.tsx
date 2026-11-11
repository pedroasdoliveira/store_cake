import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/money";
import { chargedPrice } from "../utils/pricing";

function QuantityField({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  const [draft, setDraft] = useState(String(quantity));

  useEffect(() => {
    setDraft(String(quantity));
  }, [quantity]);

  return (
    <input
      type="number"
      min={1}
      value={draft}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        const parsed = Number(next);
        if (Number.isFinite(parsed) && parsed >= 1) {
          onChange(parsed);
        }
      }}
    />
  );
}

export function Carrinho() {
  const { items, remove, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <section className="panel">
        <h1>Carrinho</h1>
        <p>Seu carrinho está vazio.</p>
        <Link to="/" className="button-link">
          Ver vitrine
        </Link>
      </section>
    );
  }

  return (
    <section className="panel">
      <h1>Carrinho</h1>
      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.id}>
            <img src={item.imageUrl} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              <p>{formatCurrency(chargedPrice(item))}</p>
            </div>
            <label>
              Qtd
              <QuantityField quantity={item.quantity} onChange={(quantity) => updateQuantity(item.id, quantity)} />
            </label>
            <strong>{formatCurrency(chargedPrice(item) * item.quantity)}</strong>
            <button type="button" className="ghost" onClick={() => remove(item.id)}>
              Remover
            </button>
          </li>
        ))}
      </ul>
      <footer className="cart-summary">
        <p>
          Total: <strong>{formatCurrency(total)}</strong>
        </p>
        <Link to="/checkout" className="button-link">
          Finalizar pedido
        </Link>
      </footer>
    </section>
  );
}
