import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type { FeedbackMessage, StoreSettings } from "../../types";
import { Feedback } from "../Feedback";

const emptyStore: StoreSettings = {
  storeName: "",
  headline: "",
  description: "",
  phone: "",
  contactEmail: "",
};

export function StoreSettingsForm() {
  const { user } = useAuth();
  const [form, setForm] = useState<StoreSettings>(emptyStore);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getStore()
      .then(setForm)
      .catch((error: Error) => setFeedback({ type: "error", text: error.message }))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const saved = await api.updateStore(user.userId, form);
      setForm(saved);
      setFeedback({ type: "success", text: "Configurações da loja salvas." });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Não foi possível salvar a loja.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Carregando configurações...</p>;
  }

  return (
    <div className="admin-section">
      <h2>Configurações da loja</h2>
      <p>O nome, o título e o contato aparecem na página inicial.</p>
      <Feedback message={feedback} />
      <form onSubmit={onSubmit} className="form">
        <label>
          Nome da loja
          <input
            value={form.storeName}
            onChange={(event) => setForm({ ...form, storeName: event.target.value })}
            required
          />
        </label>
        <label>
          Título da vitrine
          <input
            value={form.headline}
            onChange={(event) => setForm({ ...form, headline: event.target.value })}
            required
          />
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
          Telefone
          <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
        </label>
        <label>
          E-mail de contato
          <input
            type="email"
            value={form.contactEmail}
            onChange={(event) => setForm({ ...form, contactEmail: event.target.value })}
            required
          />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar loja"}
        </button>
      </form>
    </div>
  );
}
