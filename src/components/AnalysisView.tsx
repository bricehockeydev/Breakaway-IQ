"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AnalysisDTO } from "@/types/analysis";
import { getSkill } from "@/lib/hockey/skills";
import { getDrill } from "@/lib/hockey/drills";
import { ScoreDial } from "@/components/ScoreDial";

export function AnalysisView({ id }: { id: string }) {
  const [data, setData] = useState<AnalysisDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/analyses/${id}`, { cache: "no-store" });
        if (!res.ok) {
          setError(res.status === 404 ? "Analysis not found." : "Failed to load.");
          return;
        }
        const dto = (await res.json()) as AnalysisDTO;
        if (cancelled) return;
        setData(dto);
        if (dto.status === "processing") {
          timer.current = setTimeout(poll, 2500);
        }
      } catch {
        if (!cancelled) timer.current = setTimeout(poll, 4000);
      }
    }

    poll();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [id]);

  if (error) {
    return (
      <div>
        <p className="text-accent">{error}</p>
        <Link href="/dashboard" className="mt-3 inline-block text-sm text-primary underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!data) return <Skeleton label="Loading…" />;

  const skill = getSkill(data.skillKey);

  if (data.status === "draft") {
    return (
      <div>
        <h1 className="text-xl font-bold">Finish trimming your clip</h1>
        <p className="mt-2 text-sm text-muted">
          This {data.skillName} clip hasn&apos;t been submitted yet.
        </p>
        <Link
          href={`/analysis/${data.id}/trim`}
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg"
        >
          Trim &amp; analyze →
        </Link>
      </div>
    );
  }

  if (data.status === "processing") {
    return <Skeleton label={`Analyzing your ${data.skillName}…`} />;
  }

  if (data.status === "failed") {
    return (
      <div>
        <h1 className="text-xl font-bold">Analysis failed</h1>
        <p className="mt-2 text-sm text-muted">
          {data.errorMessage ?? "Something went wrong processing this clip."}
        </p>
        <div className="mt-4 flex gap-3 text-sm">
          <Link
            href={`/analyze/${data.skillKey}`}
            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-fg"
          >
            Try again
          </Link>
          <Link href="/dashboard" className="rounded-lg border border-border px-4 py-2">
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const r = data.result;
  if (!r) return <Skeleton label="Finishing up…" />;

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
        ← Dashboard
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{data.skillName} breakdown</h1>
          <p className="text-xs text-muted">
            {new Date(data.createdAt).toLocaleString()}
          </p>
        </div>
        <ScoreDial score={r.overallScore} />
      </div>

      {!r.filmingUsable && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Re-film for a better read:</strong> {r.filmingNotes}
        </div>
      )}

      <video
        src={data.videoUrl}
        controls
        className="mt-4 w-full rounded-xl border border-border bg-black"
      />
      {data.trimStartSec != null && data.trimEndSec != null && (
        <p className="mt-1 text-xs text-muted">
          Analyzed {data.trimStartSec.toFixed(1)}s–{data.trimEndSec.toFixed(1)}s of the clip
        </p>
      )}

      <section className="mt-6">
        <h2 className="font-semibold">Summary</h2>
        <p className="mt-1 text-sm text-muted">{r.overallSummary}</p>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Top things to fix</h2>
        <ol className="mt-2 space-y-1">
          {r.keyFlaws.map((flaw, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="font-semibold text-accent">{i + 1}.</span>
              <span>{flaw}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Phase by phase</h2>
        <div className="mt-2 space-y-3">
          {r.phases.map((p) => {
            const phaseName =
              skill?.phases.find((sp) => sp.key === p.phaseKey)?.name ?? p.phaseKey;
            return (
              <div key={p.phaseKey} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{phaseName}</div>
                  <div className="text-sm font-semibold">{p.score}/10</div>
                </div>
                <p className="mt-1 text-sm text-emerald-700">
                  <span className="font-medium">Good:</span> {p.whatWentWell}
                </p>
                <p className="mt-1 text-sm text-rose-700">
                  <span className="font-medium">Fix:</span> {p.whatToFix}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Your drills</h2>
        <div className="mt-2 space-y-3">
          {r.recommendedDrills.map((rd) => {
            const drill = getDrill(rd.drillKey);
            if (!drill) return null;
            return (
              <div key={rd.drillKey} className="rounded-xl border border-border bg-surface p-4">
                <div className="font-medium">{drill.name}</div>
                <p className="mt-1 text-sm text-muted">
                  <span className="font-medium text-foreground">Why:</span> {rd.why}
                </p>
                <p className="mt-1 text-sm text-muted">{drill.description}</p>
                <p className="mt-1 text-xs font-medium text-primary">{drill.prescription}</p>
                {drill.videoUrl && (
                  <a
                    href={drill.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-primary underline"
                  >
                    ▶ Watch the drill
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 mb-4">
        <h2 className="font-semibold">Coaching notes</h2>
        <p className="mt-1 text-sm text-muted">{r.coachingNotes}</p>
      </section>

      <Link
        href={`/analyze/${data.skillKey}`}
        className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:opacity-90"
      >
        Analyze another clip
      </Link>
    </div>
  );
}

function Skeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      <p className="mt-4 text-sm text-muted">{label}</p>
    </div>
  );
}
