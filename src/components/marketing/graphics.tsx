/* Inline SVG graphics for the marketing pages. Stroke uses currentColor. */

export function IconFilm(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M3 15h18M8 4v16M16 4v16" />
    </svg>
  );
}

export function IconScissors(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M8.1 8.1 20 20M8.1 15.9 20 4M12 12l3 3" />
    </svg>
  );
}

export function IconClipboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M8.5 10h7M8.5 14h7M8.5 18h4" />
    </svg>
  );
}

export function IconTrend(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M4 19h16M6 15l4-4 3 3 5-6" />
      <path d="M18 8h3v3" />
    </svg>
  );
}

export function IconShooting(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <rect x="3" y="5" width="18" height="12" rx="1" />
      <path d="M3 17l3 3M21 17l-3 3M7 9h10M7 13h10" />
      <ellipse cx="6.5" cy="20.3" rx="2.3" ry="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSkating(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M8 3v11M8 14c0 2 1 3 3 3h6M6 20h13M6 20l1-2M19 20l-1-2" />
      <circle cx="8" cy="3" r="0" />
    </svg>
  );
}

export function IconStick(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M5 4l11 13M16 17H7l-2-2" />
      <ellipse cx="19" cy="19" rx="2.4" ry="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** A schematic left-to-right diagram of the phases of a shot, each with a check or a fix flag. */
export function PhaseStrip({
  phases,
}: {
  phases: { name: string; state: "good" | "fix" }[];
}) {
  return (
    <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
      {phases.map((p, i) => (
        <div key={p.name} className="flex items-center gap-2">
          <div
            className={`flex min-w-[140px] items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${
              p.state === "good"
                ? "border-emerald-200 bg-emerald-50"
                : "border-rose-200 bg-rose-50"
            }`}
          >
            <span className="whitespace-nowrap font-medium">{p.name}</span>
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${
                p.state === "good" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            >
              {p.state === "good" ? "✓" : "!"}
            </span>
          </div>
          {i < phases.length - 1 && (
            <span className="text-muted" aria-hidden>
              →
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Decorative rink-corner arc + hash marks, absolutely positioned by the parent. */
export function RinkCorner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M200 8 H60 A52 52 0 0 0 8 60 V200" opacity="0.5" />
      <path d="M40 200 V150 M70 200 V150 M120 8 V58 M150 8 V58" opacity="0.35" />
      <circle cx="130" cy="120" r="34" opacity="0.4" />
      <circle cx="130" cy="120" r="2.5" fill="currentColor" />
    </svg>
  );
}
