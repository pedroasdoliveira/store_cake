import type { Product } from "../../types";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/money";
import { chargedPrice } from "../../utils/pricing";

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
          <div className="price-row">
            {(product.discountPercent ?? 0) > 0 && (
              <s className="price-old">{formatCurrency(product.price)}</s>
            )}
            <strong>{formatCurrency(chargedPrice(product))}</strong>
          </div>
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
