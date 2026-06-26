type Props = {
  title: string | null;
  source: string | null;
};

export default function SourceBadge({ title, source }: Props) {
  const label = title ?? source ?? "Unknown";

  return <span className="source-badge">{label}</span>;
}
