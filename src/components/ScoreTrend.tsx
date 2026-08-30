interface Point {
  date: string; // ISO
  score: number;
}

/** Small inline SVG line chart of overall score over time (0–10). */
export function ScoreTrend({ points }: { points: Point[] }) {
  if (points.length < 2) {
    return (
      <p className="text-sm text-muted">
        Run this skill again to start tracking a trend.
      </p>
    );
  }

  const w = 520;
  const h = 140;
  const pad = { top: 12, right: 12, bottom: 22, left: 26 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const t0 = +new Date(points[0].date);
  const t1 = +new Date(points[points.length - 1].date);
  const span = Math.max(t1 - t0, 1);

  const x = (d: string) => pad.left + ((+new Date(d) - t0) / span) * innerW;
  const y = (s: number) => pad.top + (1 - s / 10) * innerH;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.date).toFixed(1)} ${y(p.score).toFixed(1)}`)
    .join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[420px]" role="img">
        {[0, 2.5, 5, 7.5, 10].map((g) => (
          <g key={g}>
            <line
              x1={pad.left}
              x2={w - pad.right}
              y1={y(g)}
              y2={y(g)}
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text x={4} y={y(g) + 3} fontSize="9" fill="var(--muted)">
              {g}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(p.date)}
            cy={y(p.score)}
            r="3.5"
            fill="var(--primary)"
          />
        ))}
        <text x={pad.left} y={h - 6} fontSize="9" fill="var(--muted)">
          {new Date(points[0].date).toLocaleDateString()}
        </text>
        <text
          x={w - pad.right}
          y={h - 6}
          fontSize="9"
          fill="var(--muted)"
          textAnchor="end"
        >
          {new Date(points[points.length - 1].date).toLocaleDateString()}
        </text>
      </svg>
    </div>
  );
}
