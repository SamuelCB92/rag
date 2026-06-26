import ReactMarkdown from "react-markdown";

type Props = {
  role: "user" | "assistant";
  text: string;
};

export default function MessageBubble({ role, text }: Props) {
  const isUser = role === "user";
  return (
    <div
      className={
        isUser
          ? "message-bubble message-bubble--user"
          : "message-bubble message-bubble--assistant"
      }
    >
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
