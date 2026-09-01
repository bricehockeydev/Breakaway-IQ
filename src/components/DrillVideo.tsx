"use client";

import { useState } from "react";

/**
 * Shows a drill demo video.
 * - If `explicitUrl` is a YouTube link, renders a "Watch the drill" link.
 * - Otherwise tries `/drills/<drillKey>.mp4` (drop files in public/drills/) and
 *   quietly hides itself if there's no file there.
 */
export function DrillVideo({
  drillKey,
  explicitUrl,
}: {
  drillKey: string;
  explicitUrl?: string;
}) {
  const [hidden, setHidden] = useState(false);
  const [extIdx, setExtIdx] = useState(0);

  if (explicitUrl) {
    const isYouTube = /youtu\.?be/.test(explicitUrl);
    if (isYouTube) {
      return (
        <a
          href={explicitUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-primary underline"
        >
          ▶ Watch the drill
        </a>
      );
    }
    return (
      <video
        src={explicitUrl}
        controls
        preload="none"
        className="mt-2 w-full max-w-sm rounded-lg border border-border bg-black"
      />
    );
  }

  if (hidden) return null;

  // Try common extensions in order; hide once none work.
  const exts = ["mp4", "mov", "webm"];
  const src = `/drills/${drillKey}.${exts[extIdx]}`;

  return (
    <video
      key={src}
      src={src}
      controls
      preload="none"
      onError={() =>
        extIdx < exts.length - 1 ? setExtIdx(extIdx + 1) : setHidden(true)
      }
      className="mt-2 w-full max-w-sm rounded-lg border border-border bg-black"
    />
  );
}
