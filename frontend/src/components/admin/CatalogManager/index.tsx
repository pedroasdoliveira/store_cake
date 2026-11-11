import { FormEvent, useEffect, useState } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../../context/AuthContext";
import type { Category, FeedbackMessage } from "../../../types";
import { Feedback } from "../../Feedback";

export function CatalogManager() {
  const { user } = useAuth();
  const [catalogs, setCatalogs] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .listCategories()
      .then(setCatalogs)
      .catch((error: Error) => setFeedback({ type: "error", text: error.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await api.createCategory(user.userId, { name, description });
      setName("");
      setDescription("");
      setFeedback({ type: "success", text: "Catálogo adicionado à vitrine." });
      load();
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Não foi possível criar o catálogo.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-section">
      <h2>Catálogos</h2>
      <p>Crie uma vitrine nova, no mesmo estilo de Clássicos, Chocolate e Frutas.</p>
      <Feedback message={feedback} />
      <form onSubmit={onSubmit} className="form">
        <label>
          Nome
          <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} />
        </label>
        <label>
          Descrição
          <input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={240} />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Adicionar catálogo"}
        </button>
      </form>
      {loading ? <p>Carregando catálogos...</p> : null}
      <ul className="admin-list">
        {catalogs.map((catalog) => (
          <li key={catalog.id}>
            <strong>{catalog.name}</strong>
            {catalog.description ? <span> — {catalog.description}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
