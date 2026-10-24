import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/money";

export function ProductCard({ product, onAdded }: { product: Product; onAdded: () => void }) {
  const { add } = useCart();

  return (
    <article className="card">
      <img src={product.imageUrl} alt={product.name} />
      <div className="card-body">
        <span className="badge">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="card-footer">
          <strong>{formatCurrency(product.price)}</strong>
          <button
            type="button"
            onClick={() => {
              add(product);
              onAdded();
            }}
          >
            Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}
