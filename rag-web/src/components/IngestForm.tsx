import { useState } from "react";
import { postIngest, getSources, deleteSource } from "../services/api";
import type { Source } from "../services/api";
import SourceBadge from "./SourceBadge";

export default function IngestForm() {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [deletingTitle, setDeletingTitle] = useState<string | null>(null);

  async function handleIngest() {
    if (!title.trim()) {
      setError("O título é obrigatório.");
      setMessage(null);
      return;
    }
    if (!content.trim()) {
      setError("Cole o conteúdo do documento antes de ingerir.");
      setMessage(null);
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await postIngest({ title, source, content });
      setMessage(result.message);
      setTitle("");
      setSource("");
      setContent("");
      if (sources.length > 0) await handleLoadSources();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo deu errado");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSources() {
    setLoadingSources(true);
    setError(null);
    try {
      const result = await getSources();
      setSources(result);
    } catch (e) {
      setSources([]);
      setError(e instanceof Error ? e.message : "Falha ao carregar fontes");
    } finally {
      setLoadingSources(false);
    }
  }

  async function handleDelete(title: string) {
    const confirmed = window.confirm(
      `Remover todos os documentos com o título "${title}"?`,
    );
    if (!confirmed) return;
    setDeletingTitle(title);
    setError(null);
    try {
      await deleteSource(title);
      setSources((prev) => prev.filter((s) => s.title !== title));
      setMessage(`"${title}" removido com sucesso.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao remover fonte");
    } finally {
      setDeletingTitle(null);
    }
  }

  return (
    <div className="ingest-form">
      <h2 className="ingest-form-title">Ingerir documento</h2>

      <div className="ingest-form-fields">
        <input
          placeholder="Título (ex: documento de versão 14.8)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="URL da fonte ou nome"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <textarea
          placeholder="Cole o conteúdo do documento aqui..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="ingest-form-textarea"
        />
        {message && (
          <p className="ingest-feedback ingest-feedback--success">{message}</p>
        )}
        {error && (
          <p className="ingest-feedback ingest-feedback--error">{error}</p>
        )}
        <button type="button" onClick={handleIngest} disabled={loading}>
          {loading ? "Ingerindo..." : "Ingerir"}
        </button>
      </div>

      <div className="ingest-form-sources">
        <button
          type="button"
          onClick={handleLoadSources}
          disabled={loadingSources}
        >
          {loadingSources ? "Carregando..." : "Mostrar fontes ingeridas"}
        </button>

        {sources.length > 0 && (
          <div className="source-badges">
            {sources.map((s, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <SourceBadge title={s.title} source={s.source} />
                <button
                  type="button"
                  onClick={() => handleDelete(s.title ?? s.source ?? "")}
                  disabled={deletingTitle === (s.title ?? s.source)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--danger)",
                    fontSize: "14px",
                    padding: "0 4px",
                  }}
                >
                  {deletingTitle === (s.title ?? s.source) ? "..." : "✕"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
