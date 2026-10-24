import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/money";

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
              <p>{formatCurrency(item.price)}</p>
            </div>
            <label>
              Qtd
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
              />
            </label>
            <strong>{formatCurrency(item.price * item.quantity)}</strong>
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
