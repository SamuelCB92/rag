import { useState } from "react";
import { postIngest, getSources } from "../services/api";
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
        {error && <p className="ingest-feedback ingest-feedback--error">{error}</p>}

        <button
          type="button"
          onClick={handleIngest}
          disabled={loading}
        >
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
              <SourceBadge key={i} title={s.title} source={s.source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
