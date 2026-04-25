const API_BASE = "http://localhost:5282";

async function errorMessageFromResponse(response: Response): Promise<string> {
  const text = await response.text();
  if (!text.trim()) return `Erro ${response.status}`;
  try {
    const data: unknown = JSON.parse(text);
    if (data && typeof data === "object") {
      const o = data as Record<string, unknown>;
      for (const key of ["title", "detail", "message"] as const) {
        const v = o[key];
        if (typeof v === "string" && v.trim()) return v;
      }
    }
  } catch {
    /* plain text body */
  }
  return text;
}

export type IngestBody = {
  title: string;
  content: string;
  source: string;
};

export type ChatBody = {
  question: string;
};

export type ChatResponse = {
  answer: string;
  sources: string[];
};

export type Source = {
  title: string | null;
  source: string | null;
};

export async function postIngest(
  body: IngestBody,
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/api/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(await errorMessageFromResponse(response));
  return response.json();
}

export async function postChat(body: ChatBody): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(await errorMessageFromResponse(response));
  return response.json();
}

export async function getSources(): Promise<Source[]> {
  const response = await fetch(`${API_BASE}/api/sources`);
  if (!response.ok) throw new Error(await errorMessageFromResponse(response));
  return response.json();
}
