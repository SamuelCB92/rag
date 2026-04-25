import { useState } from "react";
import { postChat } from "../services/api";
import type { ChatResponse } from "../services/api";
import MessageBubble from "./MessageBubble";

type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: string[];
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response: ChatResponse = await postChat({ question: input });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: response.answer, sources: response.sources },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo deu errado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: "12px",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            text={msg.text}
            sources={msg.sources}
          />
        ))}
        {loading && <p style={{ color: "#888" }}>Pensando...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Pergunte algo..."
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
