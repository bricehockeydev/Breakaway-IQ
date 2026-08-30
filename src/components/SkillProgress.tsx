"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProgressAnalysis } from "@/lib/analyses";

interface Props {
  skillName: string;
  phaseNames: { key: string; name: string }[];
  /** oldest first */
  analyses: ProgressAnalysis[];
}

export function SkillProgress({ skillName, phaseNames, analyses }: Props) {
  const [aId, setAId] = useState(analyses[0]?.id ?? "");
  const [bId, setBId] = useState(analyses[analyses.length - 1]?.id ?? "");

  const a = analyses.find((x) => x.id === aId) ?? analyses[0];
  const b = analyses.find((x) => x.id === bId) ?? analyses[analyses.length - 1];

  const fmt = (iso: string) => new Date(iso).toLocaleDateString();
  const fixFor = (an: ProgressAnalysis, key: string) =>
    an.phaseFixes.find((p) => p.phaseKey === key)?.whatToFix?.trim() ?? "";

  return (
    <div>
      {analyses.length >= 2 && (
        <section className="mt-6">
          <h2 className="font-semibold">Then vs. now</h2>

          <div className="mt-2 grid grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-muted">Then</span>
              <select
                value={a.id}
                onChange={(e) => setAId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-2 py-1.5"
              >
                {analyses.map((x, i) => (
                  <option key={x.id} value={x.id}>
                    #{i + 1} · {fmt(x.createdAt)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-muted">Now</span>
              <select
                value={b.id}
                onChange={(e) => setBId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-2 py-1.5"
              >
                {analyses.map((x, i) => (
                  <option key={x.id} value={x.id}>
                    #{i + 1} · {fmt(x.createdAt)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[a, b].map((x, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-surface p-3">
                <div className="text-xs text-muted">{fmt(x.createdAt)}</div>
                <video
                  src={x.videoUrl}
                  controls
                  className="mt-2 w-full rounded-lg border border-border bg-black"
                />
              </div>
            ))}
          </div>

          <h3 className="mt-6 text-sm font-semibold">Phase by phase</h3>
          <div className="mt-2 space-y-2">
            {phaseNames.map((p) => {
              const then = fixFor(a, p.key);
              const now = fixFor(b, p.key);
              const cleared = then && !now;
              return (
                <div
                  key={p.key}
                  className="rounded-lg border border-border bg-surface p-3 text-sm"
                >
                  <div className="flex items-center gap-2 font-medium">
                    {p.name}
                    {cleared && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        cleared
                      </span>
                    )}
                    {!then && !now && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        clean both times
                      </span>
                    )}
                  </div>
                  <div className="mt-1 grid gap-1 sm:grid-cols-2">
                    <p className="text-muted">
                      <span className="font-medium text-foreground">Then:</span>{" "}
                      {then || "clean"}
                    </p>
                    <p className="text-muted">
                      <span className="font-medium text-foreground">Now:</span>{" "}
                      {now || "clean"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <h3 className="font-semibold">Priorities then</h3>
              <ul className="mt-1 list-disc pl-4 text-muted">
                {a.keyFlaws.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Priorities now</h3>
              <ul className="mt-1 list-disc pl-4 text-muted">
                {b.keyFlaws.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="mt-8 mb-4">
        <h2 className="font-semibold">All {skillName} breakdowns</h2>
        <ul className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {[...analyses].reverse().map((x, i) => (
            <li key={x.id}>
              <Link
                href={`/analysis/${x.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-background"
              >
                <span className="text-sm">
                  #{analyses.length - i} · {new Date(x.createdAt).toLocaleString()}
                </span>
                <span className="text-xs text-muted">
                  {x.keyFlaws.length} priorit{x.keyFlaws.length === 1 ? "y" : "ies"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
