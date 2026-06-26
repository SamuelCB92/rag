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
    const question = input.trim();
    if (!question) return;

    const userMessage: Message = { role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response: ChatResponse = await postChat({ question });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: response.answer, sources: response.sources },
      ]);
    } catch (e) {
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
      setError(e instanceof Error ? e.message : "Algo deu errado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="chat-window"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        gap: "10px",
      }}
    >
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} text={msg.text} />
        ))}
        {loading && <p className="chat-status">Pensando...</p>}
        {error && <p className="chat-error">{error}</p>}
      </div>

      <div className="chat-composer">
        <input
          className="chat-composer__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Pergunte algo..."
        />
        <button
          type="button"
          className="chat-composer__send"
          onClick={handleSend}
          disabled={loading}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
