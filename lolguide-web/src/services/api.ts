const API_BASE = "http://localhost:5282";

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

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function postChat(body: ChatBody): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function getSources(): Promise<Source[]> {
  const response = await fetch(`${API_BASE}/api/sources`);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
