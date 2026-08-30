const STYLES: Record<string, string> = {
  draft: "bg-sky-100 text-sky-800",
  processing: "bg-amber-100 text-amber-800",
  complete: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
};

const LABELS: Record<string, string> = {
  draft: "Needs trimming",
  processing: "Analyzing…",
  complete: "Complete",
  failed: "Failed",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        STYLES[status] ?? "bg-zinc-100 text-zinc-700"
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
