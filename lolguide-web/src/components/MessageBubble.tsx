type Props = {
  role: "user" | "assistant";
  text: string;
  sources?: string[];
};

export default function MessageBubble({ role, text, sources }: Props) {
  const isUser = role === "user";

  return (
    <div
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        backgroundColor: isUser ? "#D4A843" : "#1a1a1a",
        color: isUser ? "#111" : "#fff",
        padding: "10px 14px",
        borderRadius: "12px",
        maxWidth: "75%",
      }}
    >
      <p style={{ margin: 0 }}>{text}</p>
      {sources && sources.length > 0 && (
        <div style={{ marginTop: "6px", fontSize: "11px", opacity: 0.7 }}>
          {sources.map((s, i) => (
            <span key={i} style={{ marginRight: "6px" }}>
              📄 {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
