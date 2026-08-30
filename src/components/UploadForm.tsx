"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function UploadForm({
  skillKey,
  skillName,
}: {
  skillKey: string;
  skillName: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!file) return;
    setSubmitting(true);
    setError(null);

    const form = new FormData();
    form.set("skillKey", skillKey);
    form.set("video", file);

    try {
      const res = await fetch("/api/analyses", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        setSubmitting(false);
        return;
      }
      router.push(`/analysis/${data.id}/trim`);
    } catch {
      setError("Network error during upload.");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="font-semibold">Upload your {skillName} clip</h2>

      <div
        className="mt-3 cursor-pointer rounded-lg border-2 border-dashed border-border px-4 py-8 text-center hover:border-primary"
        onClick={() => inputRef.current?.click()}
      >
        {file ? (
          <p className="text-sm">
            <span className="font-medium">{file.name}</span>{" "}
            <span className="text-muted">
              ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </span>
          </p>
        ) : (
          <p className="text-sm text-muted">
            Click to choose a video (MP4, MOV or WebM · max 100 MB)
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setError(null);
          }}
        />
      </div>

      {error && <p className="mt-3 text-sm text-accent">{error}</p>}

      <button
        onClick={submit}
        disabled={!file || submitting}
        className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-fg hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Uploading…" : "Upload & trim"}
      </button>
      <p className="mt-2 text-xs text-muted">
        Next you&apos;ll trim the clip to the rep, then it&apos;s analyzed (~20–40s).
      </p>
    </div>
  );
}
