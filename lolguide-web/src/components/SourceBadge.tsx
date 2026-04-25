type Props = {
  title: string | null;
  source: string | null;
};

export default function SourceBadge({ title, source }: Props) {
  const label = title ?? source ?? "Unknown";

  return (
    <span
      style={{
        backgroundColor: "#2a2a2a",
        color: "#D4A843",
        padding: "2px 8px",
        borderRadius: "12px",
        fontSize: "12px",
        border: "1px solid #D4A843",
      }}
    >
      {label}
    </span>
  );
}
