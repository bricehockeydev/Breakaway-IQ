export function Wordmark({
  className = "",
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span
      className={`font-semibold tracking-tight ${onDark ? "text-white" : "text-foreground"} ${className}`}
    >
      Breakaway<span className="text-accent">&nbsp;IQ</span>
    </span>
  );
}
