import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { Feedback } from "../components/Feedback";
import { ProductCard } from "../components/ProductCard";
import type { Category, FeedbackMessage, Product, Promotion } from "../types";

export function Catalogo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [category, setCategory] = useState("todos");
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .listProducts()
      .then(setProducts)
      .catch((error: Error) => setFeedback({ type: "error", text: error.message }))
      .finally(() => setLoading(false));
    api.listCategories().then(setCatalogs).catch(() => setCatalogs([]));
    api.listPromotions().then(setPromotions).catch(() => setPromotions([]));
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set([...catalogs.map((item) => item.name), ...products.map((product) => product.category)])
    );
    return ["todos", ...unique];
  }, [catalogs, products]);

  const visible = products.filter(
    (product) => category === "todos" || product.category === category
  );

  return (
    <section>
      <div className="hero">
        <div>
          <p className="eyebrow">Loja de cupcakes artesanais</p>
          <h1>Sabores pensados para adoçar o seu dia</h1>
          <p>Escolha um cupcake, monte o carrinho e finalize o pedido com entrega em casa.</p>
        </div>
      </div>

      <Feedback message={feedback} />

      {promotions.length > 0 && (
        <div className="promo-list">
          {promotions.map((promotion) => (
            <article key={promotion.id} className="promo-card">
              <strong>{promotion.title}</strong>
              <p>
                {promotion.description} Use no pedido e ganhe {promotion.discountPercent}% .
              </p>
            </article>
          ))}
        </div>
      )}

      <div className="filters">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={item === category ? "chip active" : "chip"}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Carregando vitrine...</p>
      ) : (
        <>
          {visible.length === 0 && <p>Nenhum cupcake neste catálogo.</p>}
          <div className="grid">
            {visible.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdded={() =>
                  setFeedback({ type: "success", text: `${product.name} adicionado ao carrinho.` })
                }
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
