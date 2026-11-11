import { Link, useLocation } from "react-router-dom";
import { Feedback } from "../../components/Feedback";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/money";
import { chargedPrice } from "../../utils/pricing";

export function Carrinho() {
  const { items, remove, updateQuantity, total } = useCart();
  const missingNames = (useLocation().state as { missingNames?: string[] } | null)?.missingNames ?? [];
  const missingMessage =
    missingNames.length > 0
      ? { type: "error" as const, text: `Estes itens não estão mais no cardápio: ${missingNames.join(", ")}.` }
      : null;

  if (items.length === 0) {
    return (
      <section className="panel">
        <h1>Seu carrinho</h1>
        <Feedback message={missingMessage} />
        <p>Seu carrinho está vazio.</p>
        <Link to="/" className="button-link">
          Ver vitrine
        </Link>
      </section>
    );
  }

  return (
    <section className="cart-layout">
      <h1>Seu carrinho</h1>
      <Feedback message={missingMessage} />
      <div className="cart-columns">
        <ul className="cart-list panel">
          {items.map((item) => {
            const unitPrice = chargedPrice(item);
            return (
              <li key={item.id}>
                <img src={item.imageUrl} alt={item.name} />
                <div>
                  <h2>{item.name}</h2>
                  <p>{formatCurrency(unitPrice)}</p>
                  <div className="qty-stepper">
                    <button
                      type="button"
                      aria-label={`Diminuir quantidade de ${item.name}`}
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Aumentar quantidade de ${item.name}`}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button type="button" className="ghost" onClick={() => remove(item.id)}>
                    Remover
                  </button>
                </div>
                <strong>{formatCurrency(unitPrice * item.quantity)}</strong>
              </li>
            );
          })}
        </ul>
        <aside className="panel cart-summary-card">
          <h2>Resumo</h2>
          <dl className="checkout-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
            <div>
              <dt>Entrega</dt>
              <dd>Grátis</dd>
            </div>
            <div className="checkout-grand-total">
              <dt>Total</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>
          <Link to="/checkout" className="button-link">
            Finalizar compra
          </Link>
        </aside>
      </div>
    </section>
  );
}
