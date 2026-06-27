import { useState } from "react";
import { postIngest, postIngestPdf, getSources, deleteSource } from "../services/api";
import type { Source } from "../services/api";
import SourceBadge from "./SourceBadge";

type IngestMode = "text" | "pdf";

function titleFromFileName(fileName: string): string {
  const base = fileName.replace(/\.pdf$/i, "").trim();
  return base || "Untitled";
}

export default function IngestForm() {
  const [mode, setMode] = useState<IngestMode>("text");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [content, setContent] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [deletingTitle, setDeletingTitle] = useState<string | null>(null);

  function handleModeChange(next: IngestMode) {
    setMode(next);
    setError(null);
    setMessage(null);
  }

  function handlePdfChange(file: File | null) {
    setPdfFile(file);
    if (file) setTitle(titleFromFileName(file.name));
  }

  function resetForm() {
    setTitle("");
    setSource("");
    setContent("");
    setPdfFile(null);
  }

  async function handleIngest() {
    if (mode === "text") {
      if (!title.trim()) {
        setError("Title is required.");
        setMessage(null);
        return;
      }
      if (!content.trim()) {
        setError("Paste the document content before ingesting.");
        setMessage(null);
        return;
      }
    } else if (!pdfFile) {
      setError("Select a PDF file before ingesting.");
      setMessage(null);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result =
        mode === "text"
          ? await postIngest({ title, source, content })
          : await (async () => {
              const formData = new FormData();
              formData.append("file", pdfFile!);
              if (title.trim()) formData.append("title", title.trim());
              if (source.trim()) formData.append("source", source.trim());
              return postIngestPdf(formData);
            })();

      setMessage(result.message);
      resetForm();
      if (sources.length > 0) await handleLoadSources();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
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
      setError(e instanceof Error ? e.message : "Failed to load sources");
    } finally {
      setLoadingSources(false);
    }
  }

  async function handleDelete(title: string) {
    const confirmed = window.confirm(
      `Remove all documents titled "${title}"?`,
    );
    if (!confirmed) return;
    setDeletingTitle(title);
    setError(null);
    try {
      await deleteSource(title);
      setSources((prev) => prev.filter((s) => s.title !== title));
      setMessage(`"${title}" removed successfully.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove source");
    } finally {
      setDeletingTitle(null);
    }
  }

  return (
    <div className="ingest-form">
      <h2 className="ingest-form-title">Ingest document</h2>

      <div className="ingest-tabs" role="tablist" aria-label="Ingest method">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "text"}
          className={`ingest-tab${mode === "text" ? " ingest-tab--active" : ""}`}
          onClick={() => handleModeChange("text")}
        >
          Paste Text
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "pdf"}
          className={`ingest-tab${mode === "pdf" ? " ingest-tab--active" : ""}`}
          onClick={() => handleModeChange("pdf")}
        >
          Upload PDF
        </button>
      </div>

      <div className="ingest-form-fields">
        <input
          placeholder="Title (e.g. product FAQ v1)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Source URL or name"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />

        {mode === "text" ? (
          <textarea
            placeholder="Paste document content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="ingest-form-textarea"
          />
        ) : (
          <div className="ingest-file-field">
            <label className="ingest-file-label" htmlFor="pdf-upload">
              PDF file (max 5MB, 20 pages, text-based)
            </label>
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => handlePdfChange(e.target.files?.[0] ?? null)}
            />
            {pdfFile && (
              <p className="ingest-file-name">{pdfFile.name}</p>
            )}
          </div>
        )}

        {message && (
          <p className="ingest-feedback ingest-feedback--success">{message}</p>
        )}
        {error && (
          <p className="ingest-feedback ingest-feedback--error">{error}</p>
        )}
        <button type="button" onClick={handleIngest} disabled={loading}>
          {loading ? "Ingesting..." : "Ingest"}
        </button>
      </div>

      <div className="ingest-form-sources">
        <button
          type="button"
          onClick={handleLoadSources}
          disabled={loadingSources}
        >
          {loadingSources ? "Loading..." : "Show ingested sources"}
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
