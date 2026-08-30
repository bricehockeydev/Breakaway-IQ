import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { RinkCorner } from "@/components/marketing/graphics";

const PANEL_POINTS = [
  "Phase-by-phase read of your shot, stride and hands",
  "Your top 2–3 fixes, in priority order",
  "Drills matched to each fix, with rep counts",
  "Old rep vs. new rep, side by side, over time",
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-5xl items-stretch gap-0 px-4 py-10 lg:grid-cols-2 lg:gap-10">
      {/* Form */}
      <div className="mx-auto flex w-full max-w-sm flex-col justify-center py-6 lg:mx-0 lg:max-w-none lg:pr-6">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← <Wordmark className="text-sm" />
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <div className="mt-6 text-sm text-muted">{footer}</div>
      </div>

      {/* Brand panel */}
      <div className="relative hidden overflow-hidden rounded-2xl bg-brand-dark p-8 text-white lg:block">
        <RinkCorner className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 text-white/15" />
        <div className="relative flex h-full flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
              Brice Hockey Development
            </p>
            <p className="mt-4 text-2xl font-semibold leading-snug">
              A breakdown of your technique, the way a skills coach would give it.
            </p>
          </div>
          <ul className="space-y-3">
            {PANEL_POINTS.map((p) => (
              <li key={p} className="flex gap-3 text-sm text-white/80">
                <span className="mt-0.5 text-accent">▸</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
