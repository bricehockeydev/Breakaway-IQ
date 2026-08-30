export function ScoreDial({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(10, score));
  const pct = clamped / 10;
  const color =
    clamped >= 7.5 ? "#059669" : clamped >= 5 ? "#d97706" : "#e11d48";
  const r = 26;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
        {clamped.toFixed(1)}
      </div>
    </div>
  );
}
