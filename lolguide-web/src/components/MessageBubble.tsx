type Props = {
  role: "user" | "assistant";
  text: string;
  sources?: string[];
};

export default function MessageBubble({ role, text, sources }: Props) {
  const isUser = role === "user";
  return (
    <div
      className={
        isUser
          ? "message-bubble message-bubble--user"
          : "message-bubble message-bubble--assistant"
      }
    >
      <p>{text}</p>
      {sources && sources.length > 0 && (
        <div className="message-bubble__sources">
          {sources.map((s, i) => (
            <span key={i} style={{ marginRight: "6px" }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
