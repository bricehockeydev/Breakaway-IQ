"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProgressAnalysis } from "@/lib/analyses";
import { ScoreDial } from "@/components/ScoreDial";
import { ScoreTrend } from "@/components/ScoreTrend";

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

  return (
    <div>
      <section className="mt-6">
        <h2 className="font-semibold">Score over time</h2>
        <div className="mt-2 rounded-xl border border-border bg-surface p-4">
          <ScoreTrend
            points={analyses.map((x) => ({ date: x.createdAt, score: x.overallScore }))}
          />
        </div>
      </section>

      {analyses.length >= 2 && (
        <section className="mt-8">
          <h2 className="font-semibold">Compare</h2>

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
                    #{i + 1} · {fmt(x.createdAt)} · {x.overallScore.toFixed(1)}
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
                    #{i + 1} · {fmt(x.createdAt)} · {x.overallScore.toFixed(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[a, b].map((x, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">{fmt(x.createdAt)}</span>
                  <ScoreDial score={x.overallScore} />
                </div>
                <video
                  src={x.videoUrl}
                  controls
                  className="mt-2 w-full rounded-lg border border-border bg-black"
                />
              </div>
            ))}
          </div>

          <h3 className="mt-6 text-sm font-semibold">Phase by phase</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[360px] text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="py-1 pr-2 font-medium">Phase</th>
                  <th className="py-1 px-2 font-medium">Then</th>
                  <th className="py-1 px-2 font-medium">Now</th>
                  <th className="py-1 pl-2 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {phaseNames.map((p) => {
                  const then = a.phaseScores.find((s) => s.phaseKey === p.key)?.score;
                  const now = b.phaseScores.find((s) => s.phaseKey === p.key)?.score;
                  const diff =
                    then != null && now != null ? Number((now - then).toFixed(1)) : null;
                  return (
                    <tr key={p.key} className="border-t border-border">
                      <td className="py-1.5 pr-2">{p.name}</td>
                      <td className="py-1.5 px-2">{then ?? "—"}</td>
                      <td className="py-1.5 px-2">{now ?? "—"}</td>
                      <td
                        className={`py-1.5 pl-2 font-medium ${
                          diff == null
                            ? ""
                            : diff > 0
                              ? "text-emerald-600"
                              : diff < 0
                                ? "text-rose-600"
                                : "text-muted"
                        }`}
                      >
                        {diff == null ? "—" : diff > 0 ? `+${diff}` : diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold">Flaws then</h3>
              <ul className="mt-1 list-disc pl-4 text-muted">
                {a.keyFlaws.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Flaws now</h3>
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
        <h2 className="font-semibold">All {skillName} analyses</h2>
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
                <span className="text-sm font-semibold">{x.overallScore.toFixed(1)}/10</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
