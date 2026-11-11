import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type { Category, FeedbackMessage, Product, SaveProductPayload } from "../../types";
import { formatCurrency } from "../../utils/money";
import { chargedPrice } from "../../utils/pricing";
import { Feedback } from "../Feedback";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  category: "",
  discountPercent: "0",
};

export function ProductManager() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.listProducts(), api.listCategories()])
      .then(([nextProducts, nextCatalogs]) => {
        setProducts(nextProducts);
        setCatalogs(nextCatalogs);
        setForm((current) => ({
          ...current,
          category: current.category || nextCatalogs[0]?.name || "",
        }));
      })
      .catch((error: Error) => setFeedback({ type: "error", text: error.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const payload = (): SaveProductPayload => ({
    name: form.name,
    description: form.description,
    price: Number(form.price),
    imageUrl: form.imageUrl,
    category: form.category,
    discountPercent: Number(form.discountPercent),
  });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      if (editingId) {
        await api.updateProduct(user.userId, editingId, payload());
        setFeedback({ type: "success", text: "Produto atualizado." });
      } else {
        await api.createProduct(user.userId, payload());
        setFeedback({ type: "success", text: "Produto adicionado à vitrine." });
      }
      setEditingId(null);
      setForm({ ...emptyForm, category: catalogs[0]?.name ?? "" });
      load();
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Não foi possível salvar o produto.",
      });
    } finally {
      setSaving(false);
    }
  };

  const edit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl,
      category: product.category,
      discountPercent: String(product.discountPercent ?? 0),
    });
  };

  return (
    <div className="admin-section">
      <h2>{editingId ? "Editar produto" : "Novo produto"}</h2>
      <Feedback message={feedback} />
      <form onSubmit={onSubmit} className="form">
        <label>
          Título
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label>
          Descrição
          <input
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            required
          />
        </label>
        <label>
          Foto (URL)
          <input
            value={form.imageUrl}
            onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
            required
          />
        </label>
        <label>
          Catálogo
          <select
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
            required
          >
            {catalogs.map((catalog) => (
              <option key={catalog.id} value={catalog.name}>
                {catalog.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Preço
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
            required
          />
        </label>
        <label>
          Desconto (%)
          <input
            type="number"
            min="0"
            max="90"
            step="1"
            value={form.discountPercent}
            onChange={(event) => setForm({ ...form, discountPercent: event.target.value })}
            required
          />
        </label>
        <button type="submit" disabled={saving || catalogs.length === 0}>
          {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Adicionar produto"}
        </button>
      </form>

      {loading ? <p>Carregando produtos...</p> : null}
      <ul className="admin-list">
        {products.map((product) => (
          <li key={product.id} className="admin-card">
            <strong>{product.name}</strong>
            <p>
              {product.category} — {formatCurrency(chargedPrice(product))}
              {(product.discountPercent ?? 0) > 0 ? ` (${product.discountPercent}% off)` : ""}
            </p>
            <button type="button" className="ghost" onClick={() => edit(product)}>
              Editar {product.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
