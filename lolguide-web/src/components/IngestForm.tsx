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
    if (!content.trim()) return;
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
    try {
      const result = await getSources();
      setSources(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar fontes");
    } finally {
      setLoadingSources(false);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #2a2a2a",
        borderRadius: "8px",
        padding: "16px",
      }}
    >
      <h2 style={{ margin: "0 0 12px" }}>Ingerir Documento</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          placeholder="Título (ex: documento de versão 14.8)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <input
          placeholder="URL da fonte ou nome"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <textarea
          placeholder="Cole o conteúdo do documento aqui..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            resize: "vertical",
          }}
        />

        {message && <p style={{ color: "green", margin: 0 }}>{message}</p>}
        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

        <button
          onClick={handleIngest}
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "Ingerindo..." : "Ingerir"}
        </button>
      </div>

      <div style={{ marginTop: "16px" }}>
        <button
          onClick={handleLoadSources}
          disabled={loadingSources}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          {loadingSources ? "Carregando..." : "Mostrar fontes ingeridas"}
        </button>

        {sources.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "8px",
            }}
          >
            {sources.map((s, i) => (
              <SourceBadge key={i} title={s.title} source={s.source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
