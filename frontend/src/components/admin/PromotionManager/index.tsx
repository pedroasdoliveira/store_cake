import { FormEvent, useEffect, useState } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../../context/AuthContext";
import type { FeedbackMessage, Promotion } from "../../../types";
import { Feedback } from "../../Feedback";

const emptyForm = {
  title: "",
  description: "",
  discountPercent: "10",
  active: true,
};

export function PromotionManager() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!user) {
      return;
    }
    setLoading(true);
    api
      .listAdminPromotions(user.userId)
      .then(setPromotions)
      .catch((error: Error) => setFeedback({ type: "error", text: error.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    setSaving(true);
    setFeedback(null);
    const payload = {
      title: form.title,
      description: form.description,
      discountPercent: Number(form.discountPercent),
      active: form.active,
    };
    try {
      if (editingId) {
        await api.updatePromotion(user.userId, editingId, payload);
        setFeedback({ type: "success", text: "Promoção atualizada." });
      } else {
        await api.createPromotion(user.userId, payload);
        setFeedback({ type: "success", text: "Promoção publicada na página inicial." });
      }
      setEditingId(null);
      setForm(emptyForm);
      load();
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Não foi possível salvar a promoção.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-section">
      <h2>Promoções</h2>
      <p>A promoção ativa aparece na página inicial e pode ser escolhida em cada pedido.</p>
      <Feedback message={feedback} />
      <form onSubmit={onSubmit} className="form">
        <label>
          Título
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
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
          Percentual
          <input
            type="number"
            min="1"
            max="90"
            step="1"
            value={form.discountPercent}
            onChange={(event) => setForm({ ...form, discountPercent: event.target.value })}
            required
          />
        </label>
        <label className="check-line">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => setForm({ ...form, active: event.target.checked })}
          />
          Ativa na vitrine
        </label>
        <button type="submit" disabled={saving}>
          {saving ? "Salvando..." : editingId ? "Salvar promoção" : "Publicar promoção"}
        </button>
      </form>
      {loading ? <p>Carregando promoções...</p> : null}
      {!loading && promotions.length === 0 && <p>Nenhuma promoção cadastrada.</p>}
      <ul className="admin-list">
        {promotions.map((promotion) => (
          <li key={promotion.id} className="admin-card">
            <strong>{promotion.title}</strong>
            <p>
              {promotion.discountPercent}% — {promotion.active ? "ativa" : "pausada"}
            </p>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setEditingId(promotion.id);
                setForm({
                  title: promotion.title,
                  description: promotion.description,
                  discountPercent: String(promotion.discountPercent),
                  active: promotion.active,
                });
              }}
            >
              Editar {promotion.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
