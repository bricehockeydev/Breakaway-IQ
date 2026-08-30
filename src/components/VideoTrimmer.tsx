"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_WINDOW = 12;
const MIN_WINDOW = 1;
const DEFAULT_WINDOW = 6;

export function VideoTrimmer({
  analysisId,
  videoUrl,
  skillName,
}: {
  analysisId: string;
  videoUrl: string;
  skillName: string;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(DEFAULT_WINDOW);
  const [playhead, setPlayhead] = useState(0);
  const [drag, setDrag] = useState<null | "start" | "end">(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onLoaded() {
    const d = videoRef.current?.duration ?? 0;
    if (!Number.isFinite(d) || d <= 0) return;
    setDuration(d);
    setStart(0);
    setEnd(Math.min(d, DEFAULT_WINDOW));
  }

  // Keep playback inside the selected window when previewing.
  function onTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    setPlayhead(v.currentTime);
    if (!v.paused && v.currentTime >= end) {
      v.currentTime = start;
    }
  }

  function pctToTime(clientX: number): number {
    const el = trackRef.current;
    if (!el || duration === 0) return 0;
    const r = el.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return pct * duration;
  }

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const t = pctToTime(e.clientX);
      if (drag === "start") {
        const ns = Math.min(t, end - MIN_WINDOW);
        setStart(Math.max(0, ns));
        if (videoRef.current) videoRef.current.currentTime = Math.max(0, ns);
      } else {
        const ne = Math.max(t, start + MIN_WINDOW);
        setEnd(Math.min(duration, ne));
        if (videoRef.current) videoRef.current.currentTime = Math.min(duration, ne);
      }
    };
    const up = () => setDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag, start, end, duration]);

  function seekTo(clientX: number) {
    const t = pctToTime(clientX);
    if (videoRef.current) videoRef.current.currentTime = t;
  }

  function preview() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = start;
    v.play();
  }

  async function submit() {
    setError(null);
    const window = end - start;
    if (window < MIN_WINDOW) {
      setError("Select at least 1 second.");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/analyses/${analysisId}/trim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startSec: start, endSec: end }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not submit.");
      setSubmitting(false);
      return;
    }
    router.push(`/analysis/${analysisId}`);
  }

  const pct = (t: number) => (duration ? (t / duration) * 100 : 0);
  const windowLen = end - start;
  const fmt = (t: number) => `${t.toFixed(1)}s`;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="font-semibold">Trim your {skillName} clip</h2>
      <p className="mt-1 text-sm text-muted">
        Drag the handles to box in the rep — aim for {MIN_WINDOW}–{DEFAULT_WINDOW}{" "}
        seconds. Only this section gets analyzed.
      </p>

      <video
        ref={videoRef}
        src={videoUrl}
        controls
        onLoadedMetadata={onLoaded}
        onTimeUpdate={onTimeUpdate}
        className="mt-3 w-full rounded-lg border border-border bg-black"
      />

      {duration > 0 ? (
        <>
          <div
            ref={trackRef}
            className="relative mt-4 h-10 cursor-pointer select-none rounded-md bg-background"
            onPointerDown={(e) => seekTo(e.clientX)}
          >
            {/* selected window */}
            <div
              className="absolute inset-y-0 rounded-md bg-primary/20 ring-1 ring-primary"
              style={{ left: `${pct(start)}%`, width: `${pct(windowLen)}%` }}
            />
            {/* playhead */}
            <div
              className="absolute inset-y-0 w-0.5 bg-foreground/60"
              style={{ left: `${pct(playhead)}%` }}
            />
            {/* start handle */}
            <button
              aria-label="Trim start"
              onPointerDown={(e) => {
                e.stopPropagation();
                setDrag("start");
              }}
              className="absolute top-1/2 h-8 w-3 -translate-x-1/2 -translate-y-1/2 rounded bg-primary"
              style={{ left: `${pct(start)}%` }}
            />
            {/* end handle */}
            <button
              aria-label="Trim end"
              onPointerDown={(e) => {
                e.stopPropagation();
                setDrag("end");
              }}
              className="absolute top-1/2 h-8 w-3 -translate-x-1/2 -translate-y-1/2 rounded bg-primary"
              style={{ left: `${pct(end)}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>Start {fmt(start)}</span>
            <span
              className={
                windowLen > MAX_WINDOW ? "font-medium text-amber-600" : "font-medium"
              }
            >
              {fmt(windowLen)} selected
              {windowLen > MAX_WINDOW ? ` (first ${MAX_WINDOW}s will be used)` : ""}
            </span>
            <span>End {fmt(end)}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={preview}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-background"
            >
              ▶ Preview section
            </button>
            <button
              onClick={() => setStart(Math.min(playhead, end - MIN_WINDOW))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-background"
            >
              Set start to playhead
            </button>
            <button
              onClick={() => setEnd(Math.max(playhead, start + MIN_WINDOW))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-background"
            >
              Set end to playhead
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-accent">{error}</p>}

          <button
            onClick={submit}
            disabled={submitting}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-fg hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : `Analyze this ${Math.min(windowLen, MAX_WINDOW).toFixed(1)}s`}
          </button>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted">Loading video…</p>
      )}
    </div>
  );
}
